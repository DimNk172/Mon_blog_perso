import User from '#models/user'
import { regiserUserValidator } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { writeFile } from 'node:fs/promises'
import { toPng } from 'jdenticon'

export default class AuthController {
  register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async handleRegister({ request, session, response }: HttpContext) {
    const { email, password, thumbnail, username } =
      await request.validateUsing(regiserUserValidator)
    if (!thumbnail) {
      const png = toPng(username, 100)
      await writeFile(`public/users/${username}.png`, png)
    } else {
      await thumbnail.move(app.makePath('public/users'), { name: `${cuid()}.${thumbnail.extname}` })
    }

    const filePath = `users/${thumbnail?.fileName || username + '.png'}`
    await User.create({ email, username, thumbnail: filePath, password })
    session.flash('success', 'Inscription ok')
    return response.redirect().toRoute('auth.login')
  }

  login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }
}
