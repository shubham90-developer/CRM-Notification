import logoDark from '@/assets/images/logo.png'
import logoLight from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link href="/" className="logo-dark">
        <Image src={logoSm} width={28} height={26} className="logo-sm" alt="logo sm" />
        <Image src={logoDark} height={200} width={200} className="logo-lg" alt="logo dark" />
      </Link>
      <Link href="/" className="logo-light">
        <Image src={logoSm} width={28} height={26} className="logo-sm" alt="logo sm" />
        <Image src={logoLight} height={120} width={200} className="logo-lg" alt="logo light" />
      </Link>
    </div>
  )
}

export default LogoBox
