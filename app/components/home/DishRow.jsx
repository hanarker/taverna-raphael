'use client';

/**
 * @param {{ dish: { name: string, description?: string, price: string } }} props
 */
export default function DishRow({ dish }) {
  return (
    <div className="dish">
      <div>
        <div className="dish-name">{dish.name}</div>
        {dish.description && <div className="dish-desc">{dish.description}</div>}
      </div>
      <div className="dish-price">{dish.price}</div>

      <style jsx>{`
        .dish {
          display: flex;
          justify-content: space-between;
          gap: var(--s-4);
          padding: var(--s-4) 0;
          border-bottom: 1px dashed var(--color-line-strong);
        }

        .dish:last-child {
          border-bottom: none;
        }

        .dish-name {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 400;
        }

        .dish-desc {
          color: var(--color-text-dim);
          font-size: 0.86rem;
          margin-top: var(--s-1);
          max-width: 320px;
        }

        .dish-price {
          font-family: var(--font-mono);
          color: var(--color-brass-bright);
          white-space: nowrap;
          font-size: 0.92rem;
        }
      `}</style>
    </div>
  );
}
