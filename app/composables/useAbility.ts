import type { AppAbility, AppAction, AppSubject, CaslUser } from '~/access-control/ability'
import { defineAbilityFor } from '~/access-control/ability'

export function useAbility() {
  const { $ability } = useNuxtApp()
  const ability = $ability as AppAbility

  function updateAbility(user: CaslUser | null) {
    const newAbility = defineAbilityFor(user)
    ability.update(newAbility.rules)
  }

  function can(action: AppAction, subject: AppSubject): boolean {
    return ability.can(action, subject)
  }

  return {
    ability,
    can,
    updateAbility,
  }
}
