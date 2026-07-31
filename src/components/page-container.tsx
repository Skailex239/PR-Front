/**
 * Conteneur de contenu standard (largeur max + gouttières).
 *
 * La contrainte de largeur vit ici plutôt que dans le <main> du layout : cela
 * permet à une page de placer une section pleine largeur (le bandeau d'accueil)
 * en dehors du conteneur, tout en gardant le reste aligné.
 */
export default function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
