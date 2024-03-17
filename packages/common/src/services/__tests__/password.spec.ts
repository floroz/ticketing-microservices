import { expect, it, describe } from 'vitest'

import { PasswordService } from '../password'

describe('PasswordService', () => {
  it('should hash and compare passwords', async () => {
    const password = 'password'
    const hashedPassword = await PasswordService.hash(password)
    expect(hashedPassword).not.toBe(password)
    const isSamePassword = await PasswordService.compare(password, hashedPassword)
    expect(isSamePassword).toBe(true)
  })

  it('should not compare different passwords', async () => {
    const password = 'password'
    const differentPassword = 'differentPassword'
    const hashedPassword = await PasswordService.hash(password)
    const isSamePassword = await PasswordService.compare(differentPassword, hashedPassword)
    expect(isSamePassword).toBe(false)
  })
})

