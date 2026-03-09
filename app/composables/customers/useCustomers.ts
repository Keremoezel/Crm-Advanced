export interface CustomerListItem {
  id: number
  name: string
  industry: string
  city: string
  employeeCount: number
  revenueSize: string
  phone: string
  primaryContact: string
  primaryContactPhone: string
}

export interface Contact {
  id?: number
  isPrimary: boolean
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  birthDate: string
  linkedin: string
  xing: string
  facebook: string
  notes: string
}

export interface Customer {
  id: number
  name: string
  project: string
  legalForm: string
  industry: string
  employeeCount: number
  website: string
  phone: string
  email: string
  openingHours: string
  revenueSize: string
  street: string
  postalCode: string
  city: string
  state: string
  foundingDate: string
  description: string
  conversationHook: string
  researchResult: string
  contacts: Contact[]
}

export interface FilterOptions {
  industries: string[]
  cities: string[]
  revenueSizes: string[]
}

export function useCustomers() {
  // --- List view state ---
  const page = ref(1)
  const limit = ref(25)
  const search = ref('')
  const filterIndustry = ref<string | undefined>(undefined)
  const filterCity = ref<string | undefined>(undefined)
  const filterRevenueSize = ref<string | undefined>(undefined)
  const filterEmployeeCountMin = ref<number | undefined>(undefined)
  const filterEmployeeCountMax = ref<number | undefined>(undefined)

  // Reset page to 1 when any filter changes
  watch(
    [
      search,
      filterIndustry,
      filterCity,
      filterRevenueSize,
      filterEmployeeCountMin,
      filterEmployeeCountMax,
    ],
    () => {
      page.value = 1
    },
  )

  // --- List data fetch ---
  const {
    data: listResponse,
    status: listStatus,
    refresh: refreshList,
  } = useFetch('/api/customers', {
    query: computed(() => ({
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
      industry: filterIndustry.value || undefined,
      city: filterCity.value || undefined,
      revenueSize: filterRevenueSize.value || undefined,
      employeeCountMin: filterEmployeeCountMin.value || undefined,
      employeeCountMax: filterEmployeeCountMax.value || undefined,
    })),
  })

  const customers = computed<CustomerListItem[]>(() => {
    const res = listResponse.value as { data?: CustomerListItem[] } | null
    return res?.data || []
  })

  const pagination = computed(() => {
    const res = listResponse.value as {
      pagination?: { total: number; page: number; limit: number; pages: number }
    } | null
    return res?.pagination || { total: 0, page: 1, limit: 25, pages: 0 }
  })

  // --- Filter options fetch ---
  const { data: filterOptionsRaw } = useFetch('/api/customers/filters', {
    lazy: true,
  })

  const filterOptions = computed<FilterOptions>(() => {
    const raw = filterOptionsRaw.value as FilterOptions | null
    return {
      industries: raw?.industries || [],
      cities: raw?.cities || [],
      revenueSizes: raw?.revenueSizes || [],
    }
  })

  // --- Detail view state ---
  const selectedCustomerId = ref<number | null>(null)
  const selectedCustomer = ref<Customer | null>(null)
  const detailStatus = ref<'idle' | 'pending' | 'error'>('idle')

  const selectCustomer = async (id: number) => {
    selectedCustomerId.value = id
    detailStatus.value = 'pending'
    try {
      const data = await $fetch<Customer>(`/api/customers/${id}`)
      selectedCustomer.value = data
      detailStatus.value = 'idle'
    } catch {
      detailStatus.value = 'error'
    }
  }

  const clearSelection = () => {
    selectedCustomerId.value = null
    selectedCustomer.value = null
    detailStatus.value = 'idle'
  }

  const refreshDetail = async () => {
    if (selectedCustomerId.value) {
      await selectCustomer(selectedCustomerId.value)
    }
  }

  // --- Filter helpers ---
  const resetFilters = () => {
    search.value = ''
    filterIndustry.value = undefined
    filterCity.value = undefined
    filterRevenueSize.value = undefined
    filterEmployeeCountMin.value = undefined
    filterEmployeeCountMax.value = undefined
    page.value = 1
  }

  const hasActiveFilters = computed(() => {
    return !!(
      search.value ||
      filterIndustry.value ||
      filterCity.value ||
      filterRevenueSize.value ||
      filterEmployeeCountMin.value ||
      filterEmployeeCountMax.value
    )
  })

  return {
    // List
    customers,
    pagination,
    page,
    limit,
    listStatus,
    refreshList,
    // Filters
    search,
    filterIndustry,
    filterCity,
    filterRevenueSize,
    filterEmployeeCountMin,
    filterEmployeeCountMax,
    filterOptions,
    resetFilters,
    hasActiveFilters,
    // Detail
    selectedCustomer,
    selectedCustomerId,
    detailStatus,
    selectCustomer,
    clearSelection,
    refreshDetail,
  }
}
