import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { verifyMessage } from 'viem'
import { db } from './lib/db.js'
import { usersTable } from './lib/schema.js'

const regex = /^Wallet:\s*(.+)\nDate:\s*(.+)\nConfirmation:\s*([\s\S]*)$/m

const confirmationMessage =
  'Account Responsibility Notice\nYou are using Aura verified. By signing this message, you confirm ownership of your account. You are responsible for protecting your account and private keys. Keep them secure and do not share them with anyone.'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const { message, hashed } = req.body

  const match = message.match(regex)

  if (!match || !hashed) {
    res.status(400).send('invalid data')
    return
  }

  const [, wallet, date, confirmation] = match

  if (new Date(date).getTime() < Date.now() - 5 * 60 * 1000) {
    res.status(400).send('signature expired')
    return
  }

  if (confirmation !== confirmationMessage) {
    res.status(400).send('invalid confirmation')
    return
  }

  const isVerified = await verifyMessage({
    address: wallet,
    message,
    signature: hashed
  })

  if (!isVerified) {
    res.status(400).send('invalid signature')
    return
  }

  const result = await db.select().from(usersTable).where(eq(usersTable.id, wallet))

  if (result.length === 0) {
    await db.insert(usersTable).values({
      id: wallet,
      integrations: ['wallet']
    })

    res.json({
      id: wallet
    })
    return
  }
  res.json({
    id: result[0]?.id
  })
}
