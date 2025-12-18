import Link from "next/link"
import { Button } from "@/components/ui/Button"
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-basho-stone/10">
        
        {/* Background Image (Placeholder until you upload real ones) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=2560&auto=format&fit=crop" 
            alt="Pottery Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-basho-earth/20 mix-blend-multiply" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-md">
            Wabi-Sabi
            <span className="block text-2xl md:text-4xl mt-4 font-sans font-light tracking-widest uppercase">
              The Beauty of Imperfection
            </span>
          </h1>
          
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Handcrafted ceramics that tell a story. Born from earth, shaped by hands, and fired in tradition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-basho-earth hover:bg-basho-minimal min-w-[160px]">
                Shop Collection
              </Button>
            </Link>
            <Link href="/workshops">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white min-w-[160px]">
                Book Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Category Preview (Optional) */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-basho-earth mb-4">Curated Collections</h2>
          <div className="h-1 w-20 bg-basho-clay mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Tableware", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800" },
            { title: "Vases", img: "https://images.unsplash.com/photo-1578749556920-d78852e77f24?auto=format&fit=crop&q=80&w=800" },
            { title: "Workshops", img: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=800" }
          ].map((item, i) => (
            <div key={i} className="group relative h-96 overflow-hidden rounded-lg cursor-pointer">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-3xl font-serif tracking-wide">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}