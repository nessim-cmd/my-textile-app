import { SignIn } from '@clerk/nextjs'

export default function PageSignIn() {
  return (
    <section className='w-full h-screen flex items-center justify-center'> 
      <SignIn/>
    </section>
  )
}