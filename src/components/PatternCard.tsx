import { Link } from 'react-router-dom';
import type { PatternCategory } from '../content/patterns';

interface PatternCardProps {
  slug: string;
  name: string;
  category: PatternCategory;
}

export function PatternCard({ slug, name, category }: PatternCardProps) {
  return (
    <Link to={`/patterns/${slug}`} className="pattern-card">
      <span className={`category-badge category-badge--${category.toLowerCase()}`}>
        {category}
      </span>
      <h3 className="pattern-card__name">{name}</h3>
    </Link>
  );
}
