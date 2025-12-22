import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Zap, Rocket, Target, Settings, DollarSign, Shield, Star, Check, User, LogOut } from 'lucide-react'
import AnimatedHeadline from './components/AnimatedHeadline'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded"></div>
              <span className="text-xl font-bold text-gray-900">DexAI</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/auth/signout"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Wyloguj</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Logowanie
                  </Link>
                  <Link 
                    href="/register"
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 font-medium"
                  >
                    Rozpocznij
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <AnimatedHeadline />
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Profesjonalne zarządzanie schema markup dla firm, które chcą być znajdowane przez ChatGPT, Gemini i Perplexity. Jeden skrypt, pełna kontrola nad danymi strukturalnymi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {user ? (
                <Link
                  href="/dashboard"
                  className="relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 overflow-hidden"
                >
                  <span className="relative z-10">Przejdź do dashboardu →</span>
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 overflow-hidden"
                  >
                    <span className="relative z-10">Rozpocznij - 49 zł/msc</span>
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3 border-2 border-gray-200 text-gray-900 rounded font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    Logowanie
                  </Link>
                </>
              )}
            </div>
            {!user && (
              <p className="text-sm text-gray-500">
                Cena promocyjna: <span className="line-through">99 zł</span> <span className="font-bold text-gray-900">49 zł/miesiąc</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 px-4 sm:px-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Trzy proste kroki dzielą Cię od widoczności w AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 rounded">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-2">KROK 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Wypełnij dane
              </h3>
              <p className="text-gray-600">
                Podaj podstawowe informacje o firmie: nazwę, adres, godziny otwarcia, kontakt
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-2">KROK 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Wklej kod
              </h3>
              <p className="text-gray-600">
                Skopiuj jedną linijkę kodu i wklej ją w sekcji &lt;head&gt; swojej strony
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-2">KROK 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Gotowe!
              </h3>
              <p className="text-gray-600">
                AI już rozpoznaje Twoją firmę. Zmiany wprowadzasz w panelu - bez dotykania kodu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 px-4 sm:px-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dlaczego Dexai?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Profesjonalne rozwiązanie dla firm, które myślą o przyszłości
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 p-6 rounded">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Dedykowane dla AI
              </h3>
              <p className="text-sm text-gray-600">
                Schema markup zoptymalizowane pod ChatGPT, Gemini i inne modele AI
              </p>
            </div>

            <div className="border border-gray-200 p-6 rounded">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center mb-4">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Panel zarządzania
              </h3>
              <p className="text-sm text-gray-600">
                Aktualizuj dane w czasie rzeczywistym bez ingerencji w kod strony
              </p>
            </div>

            <div className="border border-gray-200 p-6 rounded">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Przystępna cena
              </h3>
              <p className="text-sm text-gray-600">
                Tylko 49 zł/msc. Jedna domena w cenie. Bez ukrytych kosztów.
              </p>
            </div>

            <div className="border border-gray-200 p-6 rounded">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Bezpieczeństwo
              </h3>
              <p className="text-sm text-gray-600">
                Bezpieczne CDN, dane chronione, compliance z RODO
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 px-4 sm:px-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Co mówią nasi klienci
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              Zobacz, jak nasze rozwiązanie pomogło firmom zwiększyć widoczność w wynikach wyszukiwania AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 p-8 rounded">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-xl">{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "Wcześniej musieliśmy prosić programistę o każdą zmianę w danych firmy. Teraz wystarczy panel i mamy pełną kontrolę. ChatGPT podaje aktualne godziny otwarcia."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Anna Kowalska</p>
                  <p className="text-sm text-gray-600">Właścicielka - Salon Fryzjerski</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-xl">{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "Klienci pytani przez Gemini o warsztaty w okolicy trafiają do nas. Inwestycja 49 zł zwróciła się po pierwszym kliencie. Polecam każdej lokalnej firmie."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Marek Nowak</p>
                  <p className="text-sm text-gray-600">Właściciel - Warsztat samochodowy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 px-4 sm:px-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Często zadawane pytania
            </h2>
          </div>

          <div className="space-y-4">
            <details className="border border-gray-200 rounded p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Czy muszę znać się na programowaniu?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Nie! Wystarczy raz wkleić kod na stronie (można poprosić o to programistę). Potem wszystko zarządzasz z prostego panelu - jak w WordPressie.
              </p>
            </details>

            <details className="border border-gray-200 rounded p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Jak szybko zaczyna działać?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Natychmiast po wklejeniu kodu. Wyszukiwarki AI mogą potrzebować kilku dni na zaindeksowanie danych, ale sam mechanizm działa od razu.
              </p>
            </details>

            <details className="border border-gray-200 rounded p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Co to są te 5 edycji miesięcznie?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Możesz 5 razy w miesiącu zaktualizować dane (zmienić godziny, adres, telefon itp.). Dla większości firm to w zupełności wystarcza. Limit resetuje się każdego 1. dnia miesiąca.
              </p>
            </details>

            <details className="border border-gray-200 rounded p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Czy działa z moim CMS (WordPress, Shopify, etc.)?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Tak! Dexai działa z każdą stroną internetową. Wystarczy możliwość wklejenia kodu w sekcji &lt;head&gt; - to mają wszystkie platformy.
              </p>
            </details>

            <details className="border border-gray-200 rounded p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Czy mogę anulować w każdej chwili?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Tak! Nie wiążemy Cię długimi umowami. Subskrypcję można anulować w dowolnym momencie z poziomu panelu.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Gotowy na widoczność w erze AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Dołącz do firm, które już dziś są znajdowane przez ChatGPT, Gemini i Perplexity
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-500/50"
          >
            Rozpocznij za 49 zł/msc →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded"></div>
                <span className="text-lg font-bold text-white">Dexai.pl</span>
              </div>
              <p className="text-sm">
                AI Search Optimizer dla Twojej firmy
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white">Cennik</Link></li>
                <li><Link href="/register" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Pomoc</Link></li>
                <li><Link href="/login" className="hover:text-white">Kontakt</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Regulamin</Link></li>
                <li><Link href="/login" className="hover:text-white">Polityka prywatności</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 Dexai.pl - Wszystkie prawa zastrzeżone</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
