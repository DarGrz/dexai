import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Zap, Rocket, Target, Settings, DollarSign, Shield, Star } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Dexio.pl</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 font-medium"
                >
                  Przejdź do dashboardu →
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    Logowanie
                  </Link>
                  <Link 
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md hover:from-orange-600 hover:to-orange-700 font-medium"
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Widoczność w wyszukiwarkach AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
              Zadbaj o to, by ChatGPT, Gemini i Perplexity znały Twoją firmę
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Jeden skrypt, pełna kontrola. Opinie, godziny otwarcia, dane kontaktowe - wszystko widoczne dla AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg text-lg"
                >
                  Przejdź do dashboardu →
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-lg"
                >
                  Zacznij teraz - 49 zł/msc
                </Link>
              )}
            </div>
            {!user && (
              <p className="text-sm text-gray-600">
                💎 Cena promocyjna: <span className="line-through">99 zł</span> <span className="text-orange-600 font-bold">49 zł/miesiąc</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trzy proste kroki dzielą Cię od widoczności w AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Wypełnij dane
              </h3>
              <p className="text-gray-600">
                Podaj podstawowe informacje o firmie: nazwę, adres, godziny otwarcia, kontakt
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Wklej kod
              </h3>
              <p className="text-gray-600">
                Skopiuj jedną linijkę kodu i wklej ją w sekcji &lt;head&gt; swojej strony
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Gotowe!
              </h3>
              <p className="text-gray-600">
                AI już rozpoznaje Twoją firmę. Zmiany wprowadzasz w panelu - bez dotykania kodu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dlaczego Dexio?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Profesjonalne rozwiązanie dla firm, które myślą o przyszłości
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Dedykowane dla AI
              </h3>
              <p className="text-sm text-gray-600">
                Schema markup zoptymalizowane pod ChatGPT, Gemini i inne modele AI
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Panel zarządzania
              </h3>
              <p className="text-sm text-gray-600">
                Aktualizuj dane w czasie rzeczywistym bez ingerencji w kod strony
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Przystępna cena
              </h3>
              <p className="text-sm text-gray-600">
                Tylko 49 zł/msc. Jedna domena w cenie. Bez ukrytych kosztów.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Co mówią nasi klienci
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-xl">{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Wcześniej musieliśmy prosić programistę o każdą zmianę w danych firmy. Teraz wystarczy panel i mamy pełną kontrolę. ChatGPT podaje aktualne godziny otwarcia."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Anna Kowalska</p>
                  <p className="text-sm text-gray-600">Właścicielka - Salon Fryzjerski</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-xl">{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Klienci pytani przez Gemini o warsztaty w okolicy trafiają do nas. Inwestycja 49 zł zwróciła się po pierwszym kliencie. Polecam każdej lokalnej firmie."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Marek Nowak</p>
                  <p className="text-sm text-gray-600">Właściciel - Warsztat samochodowy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prosty cennik
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bez ukrytych kosztów. Bez długich umów. Zawsze wiesz, ile płacisz.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-500 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <p className="text-white text-sm font-semibold text-center">🔥 PROMOCJA STARTOWA</p>
              </div>
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-gray-500 text-sm mb-2">Podstawowy pakiet</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">49</span>
                    <span className="text-2xl text-gray-600 ml-2">zł</span>
                    <span className="text-gray-500 ml-2">/miesiąc</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Regularna cena: <span className="line-through">99 zł</span>
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">1 domena w cenie</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Wszystkie typy schema markup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">5 edycji danych miesięcznie</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Panel zarządzania 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Aktualizacje w czasie rzeczywistym</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Support email</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="block w-full text-center px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                  Rozpocznij teraz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Często zadawane pytania
            </h2>
          </div>

          <div className="space-y-6">
            <details className="bg-gray-50 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Czy muszę znać się na programowaniu?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Nie! Wystarczy raz wkleić kod na stronie (można poprosić o to programistę). Potem wszystko zarządzasz z prostego panelu - jak w WordPressie.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Jak szybko zaczyna działać?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Natychmiast po wklejeniu kodu. Wyszukiwarki AI mogą potrzebować kilku dni na zaindeksowanie danych, ale sam mechanizm działa od razu.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Co to są te 5 edycji miesięcznie?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Możesz 5 razy w miesiącu zaktualizować dane (zmienić godziny, adres, telefon itp.). Dla większości firm to w zupełności wystarcza. Limit resetuje się każdego 1. dnia miesiąca.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Czy działa z moim CMS (WordPress, Shopify, etc.)?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Tak! Dexio działa z każdą stroną internetową. Wystarczy możliwość wklejenia kodu w sekcji &lt;head&gt; - to mają wszystkie platformy.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 group">
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
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gotowy na widoczność w erze AI?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Dołącz do firm, które już dziś są znajdowane przez ChatGPT, Gemini i Perplexity
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg shadow-2xl"
          >
            Rozpocznij za 49 zł/msc →
          </Link>
          <p className="mt-6 text-indigo-200 text-sm">
            ⚡ Aktywacja w 5 minut • 💎 Cena promocyjna ważna tylko dziś
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
                <span className="text-lg font-bold text-white">Dexio.pl</span>
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
            <p>© 2024 Dexio.pl - Wszystkie prawa zastrzeżone</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
