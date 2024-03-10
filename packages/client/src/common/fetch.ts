
 const _fetch = async <T = any>(...args: Parameters<typeof fetch>): Promise<T> => { 
  if (typeof window === 'undefined') {
    const res = await fetch('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local' + args[0], args[1])

    if (!res.ok) {
      throw new Error(await res.text())
    }
    return res.json()
  } else {
    const res = await fetch(...args)
    if (!res.ok) {
      throw new Error(await res.text())
    }
    return res.json();
  }
 }

 export { _fetch as fetch };