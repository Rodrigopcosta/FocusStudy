'use client'

import * as React from 'react'
import Link from 'next/link'
import { Target } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-card/50 py-12 md:py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2 font-black italic text-xl md:text-2xl uppercase tracking-tighter">
            <Target className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            FocusStudy
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">
            O seu foco é o nosso compromisso.
          </p>
        </div>

        <div className="flex gap-6 md:gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground/60">
          <Link
            href="/faq"
            className="hover:text-primary transition-colors italic cursor-pointer"
          >
            FAQ
          </Link>
          <Link
            href="/terms"
            className="hover:text-primary transition-colors italic cursor-pointer"
          >
            Termos
          </Link>
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors italic cursor-pointer"
          >
            Privacidade
          </Link>
          <Link
            href="mailto:suporte@focusstudy.com.br"
            className="hover:text-primary transition-colors italic cursor-pointer"
          >
            Suporte
          </Link>
        </div>

        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          © {currentYear} FOCUSSTUDY // ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  )
}
