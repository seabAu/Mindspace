import { useValStore } from "../stores/val.store"

export function useVal() {
  const store = useValStore()

  // You can add any additional logic here if needed

  return store
}
