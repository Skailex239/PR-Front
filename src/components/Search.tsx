import { Search } from 'lucide-react';
export default function SearchPlayer() { return <div className="flex gap-2"><input placeholder="Rechercher joueur..." className="px-4 py-2 rounded bg-amber-50 border-amber-200" /><button className="bg-orange-500 text-white px-4 py-2 rounded"><Search size={18}/></button></div>; }
