import Elysia, { t } from 'elysia'
import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'
// import { resend } from '@/mail/client'
// import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'
import { env } from '@/env'
import { UnauthorizedError } from './errors/unauthorized-error'
import { seedDatabase } from '@/db/seed'

export const sendAuthenticationLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userExists = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userExists) {
      throw new UnauthorizedError()
    }

    await seedDatabase(email)

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    const authLinkCode = createId()

    if (userFromEmail) {
      await db.insert(authLinks).values({
        userId: userFromEmail.id,
        code: authLinkCode,
      })
    } else {
      throw new UnauthorizedError()
    }

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    // await resend.emails.send({
    //   from: 'Pizza Shop <naoresponda@fala.dev>',
    //   to: email,
    //   subject: '[Pizza Shop] Link para login',
    //   react: AuthenticationMagicLinkTemplate({
    //     userEmail: email,
    //     authLink: authLink.toString(),
    //   }),
    // })

    return authLink.toString()
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
