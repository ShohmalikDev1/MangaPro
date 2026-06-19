import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import crypto from 'crypto'
import tls from 'tls'
import prisma from '../utils/prisma'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const resetCodes = new Map<string, { codeHash: string; expiresAt: number }>()

const generateTokens = (user: { id: string; role: string; email: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

const sendSmtpCommand = (socket: tls.TLSSocket, command?: string) => {
  return new Promise<string>((resolve, reject) => {
    let data = ''
    const onData = (chunk: Buffer) => {
      data += chunk.toString('utf8')
      const lines = data.trimEnd().split(/\r?\n/)
      const last = lines[lines.length - 1]
      if (/^\d{3} /.test(last)) {
        socket.off('data', onData)
        resolve(data)
      }
    }

    socket.on('data', onData)
    socket.once('error', reject)
    if (command) socket.write(`${command}\r\n`)
  })
}

const escapeSmtpData = (value: string) => value.replace(/^\./gm, '..')

const sendResetEmail = async (to: string, code: string) => {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS

  if (!user || !pass) {
    console.log(`[password-reset] ${to} uchun kod: ${code}`)
    return
  }

  const subject = 'MangaPro parolni tiklash kodi'
  const body = [
    'Assalomu alaykum!',
    '',
    `MangaPro parolingizni tiklash kodi: ${code}`,
    'Kod 15 daqiqa amal qiladi.',
    '',
    'Agar bu so‘rovni siz yubormagan bo‘lsangiz, xabarni e’tiborsiz qoldiring.',
  ].join('\n')

  const message = [
    `From: MangaPro <${user}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n')

  const socket = tls.connect(465, 'smtp.gmail.com', { servername: 'smtp.gmail.com' })

  try {
    await sendSmtpCommand(socket)
    await sendSmtpCommand(socket, 'EHLO mangapro.local')
    await sendSmtpCommand(socket, 'AUTH LOGIN')
    await sendSmtpCommand(socket, Buffer.from(user).toString('base64'))
    await sendSmtpCommand(socket, Buffer.from(pass).toString('base64'))
    await sendSmtpCommand(socket, `MAIL FROM:<${user}>`)
    await sendSmtpCommand(socket, `RCPT TO:<${to}>`)
    await sendSmtpCommand(socket, 'DATA')
    await sendSmtpCommand(socket, `${escapeSmtpData(message)}\r\n.`)
    await sendSmtpCommand(socket, 'QUIT')
  } finally {
    socket.end()
  }
}

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
      email: z.string().email(),
      password: z.string().min(6)
    })

    const { username, email, password } = schema.parse(req.body)

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (existing) {
      return res.status(400).json({
        error: existing.email === email
          ? 'Bu email allaqachon ro\'yxatdan o\'tgan'
          : 'Bu username band'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    })

    const tokens = generateTokens(user)
    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins },
      ...tokens
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      login: z.string(),
      password: z.string()
    })

    const { login: loginInput, password } = schema.parse(req.body)

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: loginInput }, { username: loginInput }]
      }
    })

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' })
    }

    const tokens = generateTokens(user)
    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins, avatar: user.avatar },
      ...tokens
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ma\'lumotlar noto\'g\'ri' })
    }
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const schema = z.object({ email: z.string().email() })
    const { email } = schema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const code = crypto.randomInt(100000, 999999).toString()
      const codeHash = await bcrypt.hash(code, 10)
      resetCodes.set(email, { codeHash, expiresAt: Date.now() + 15 * 60 * 1000 })
      await sendResetEmail(email, code)
    }

    res.json({ message: 'Agar email topilsa, parolni tiklash kodi yuborildi' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Email noto‘g‘ri' })
    }
    res.status(500).json({ error: 'Email yuborishda xatolik' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      code: z.string().length(6),
      password: z.string().min(6)
    })
    const { email, code, password } = schema.parse(req.body)
    const reset = resetCodes.get(email)

    if (!reset || reset.expiresAt < Date.now()) {
      resetCodes.delete(email)
      return res.status(400).json({ error: 'Kod eskirgan yoki topilmadi' })
    }

    const validCode = await bcrypt.compare(code, reset.codeHash)
    if (!validCode) {
      return res.status(400).json({ error: 'Kod noto‘g‘ri' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } })
    resetCodes.delete(email)

    res.json({ message: 'Parol yangilandi' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ma‘lumotlar noto‘g‘ri' })
    }
    res.status(500).json({ error: 'Parolni yangilashda xatolik' })
  }
}

// Google OAuth
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token taqdim etilmagan' })

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    if (!payload) return res.status(400).json({ error: 'Token yaroqsiz' })

    const { sub: googleId, email, name, picture } = payload
    if (!email) return res.status(400).json({ error: 'Email topilmadi' })

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    })

    if (!user) {
      const username = (name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 25) + '_' + Math.floor(Math.random() * 1000)

      user = await prisma.user.create({
        data: { googleId, email, username, avatar: picture }
      })
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: picture }
      })
    }

    const tokens = generateTokens(user)
    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins, avatar: user.avatar },
      ...tokens
    })
  } catch (error) {
    res.status(500).json({ error: 'Google autentifikatsiya xatosi' })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) return res.status(401).json({ error: 'Refresh token taqdim etilmagan' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' })

    const tokens = generateTokens(user)
    res.json(tokens)
  } catch {
    res.status(401).json({ error: 'Refresh token yaroqsiz' })
  }
}

// Get me
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true, coins: true, avatar: true, createdAt: true }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}
