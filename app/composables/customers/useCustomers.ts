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

export function useCustomers() {
  const page = ref(1)
  const limit = ref(25)
  const search = ref('')

  const {
    data: response,
    error,
    status,
    refresh,
  } = useFetch('/api/customers', {
    query: computed(() => ({
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
    })),
  })

  const customers = computed<Customer[]>(() => {
    const res = response.value as { data?: Customer[] } | null
    return res?.data || []
  })

  const pagination = computed(() => {
    const res = response.value as {
      pagination?: { total: number; page: number; limit: number; pages: number }
    } | null
    return (
      res?.pagination || {
        total: 0,
        page: 1,
        limit: 25,
        pages: 0,
      }
    )
  })

  const selectedCustomer = ref<Customer | null>(null)

  const selectCustomer = (customer: Customer) => {
    selectedCustomer.value = customer
  }

  const loadPage = (newPage: number) => {
    page.value = newPage
  }

  return {
    customers,
    pagination,
    selectedCustomer,
    selectCustomer,
    search,
    status,
    error,
    refresh,
    loadPage,
    page,
  }
}
