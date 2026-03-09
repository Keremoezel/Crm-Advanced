import { isNotNull, asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const [industries, cities, revenueSizes] = await Promise.all([
    db
      .selectDistinct({ value: schema.companies.industry })
      .from(schema.companies)
      .where(isNotNull(schema.companies.industry))
      .orderBy(asc(schema.companies.industry)),

    db
      .selectDistinct({ value: schema.companies.city })
      .from(schema.companies)
      .where(isNotNull(schema.companies.city))
      .orderBy(asc(schema.companies.city)),

    db
      .selectDistinct({ value: schema.companies.revenueSize })
      .from(schema.companies)
      .where(isNotNull(schema.companies.revenueSize))
      .orderBy(asc(schema.companies.revenueSize)),
  ])

  return {
    industries: industries.map((r) => r.value).filter(Boolean) as string[],
    cities: cities.map((r) => r.value).filter(Boolean) as string[],
    revenueSizes: revenueSizes.map((r) => r.value).filter(Boolean) as string[],
  }
})
