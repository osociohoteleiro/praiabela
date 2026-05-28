import { useState, useEffect } from 'react'

const phoneNumber = '557398664644'
const defaultMessage = 'Olá! Gostaria de mais informações sobre a Pousada Praia Bela.'

const WhatsAppFloat = () => {
  const [tourVisible, setTourVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => setTourVisible(!!e.detail)
    window.addEventListener('tourFloatVisible', handler)
    return () => window.removeEventListener('tourFloatVisible', handler)
  }, [])

  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className={`fixed bottom-24 lg:bottom-6 z-40 group transition-[left,right] duration-500 ease-out ${
        tourVisible ? 'left-6 right-auto' : 'right-6 left-auto'
      }`}
    >
      {/* Pulse rings (Lottie-style concentric waves) */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-wa-pulse-1 pointer-events-none" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-wa-pulse-2 pointer-events-none" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-wa-pulse-3 pointer-events-none" />

      {/* Button core */}
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl group-hover:scale-110 group-active:scale-95 transition-transform animate-wa-wobble">
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.345 0 2.15-.71 2.293-1.18.193-.598.207-.86.143-1.06-.06-.158-.227-.215-.486-.359zM16.288 27.85c-1.747 0-3.46-.488-4.992-1.404l-3.474.92.92-3.46c-.987-1.604-1.504-3.402-1.504-5.244 0-5.572 4.553-10.117 10.118-10.117 4.974 0 9.504 3.706 9.504 9.504 0 5.572-4.553 9.804-10.572 9.804zm0-22.155C9.566 5.695 4.082 11.13 4.082 17.802c0 2.13.516 4.213 1.504 6.066L4 30l6.357-1.55a13.04 13.04 0 0 0 5.93 1.379h.014c6.722 0 12.594-4.952 12.594-11.627 0-3.092-1.288-6.013-3.652-8.166-2.364-2.152-5.43-3.34-8.957-3.34z"/>
        </svg>
      </span>
    </a>
  )
}

export default WhatsAppFloat
