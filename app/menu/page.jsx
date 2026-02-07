'use client';

export default function MenuPage() {
  const menuCategories = [
    {
      title: 'Antipasti',
      items: [
        { name: 'Carpaccio di Manzo', desc: 'Con rucola e grana', price: '€18' },
        { name: 'Polpo Arrostito', desc: 'Su crema di patate', price: '€20' },
        { name: 'Tartare di Tonno', desc: 'Avocado e lime', price: '€22' },
      ],
    },
    {
      title: 'Primi Piatti',
      items: [
        { name: 'Risotto allo Zafferano', desc: 'Con ossobuco', price: '€24' },
        { name: 'Tagliolini al Tartufo', desc: 'Tartufo nero fresco', price: '€26' },
        { name: 'Ravioli di Pesce', desc: 'Sugo di crostacei', price: '€25' },
      ],
    },
    {
      title: 'Secondi Piatti',
      items: [
        { name: 'Filetto al Pepe Verde', desc: 'Con patate al forno', price: '€28' },
        { name: 'Branzino al Sale', desc: 'Verdure di stagione', price: '€30' },
        { name: 'Agnello Scottadito', desc: 'Carciofi alla romana', price: '€28' },
      ],
    },
  ];

  return (
    <div className="page-container container">
      <h1 className="page-title">Il Nostro Menu</h1>

      <div className="menu-sections">
        {menuCategories.map((category, index) => (
          <div key={index} className="menu-category">
            <h2>{category.title}</h2>
            <ul className="menu-list">
              {category.items.map((item, idx) => (
                <li key={idx} className="menu-list-item">
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price}</span>
                  </div>
                  <p className="item-desc">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-container {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
        }

        .page-title {
          text-align: center;
          font-size: 3rem;
          margin-bottom: var(--spacing-lg);
          color: var(--color-primary);
        }

        .menu-category {
          margin-bottom: 4rem;
        }

        .menu-category h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          border-bottom: 1px solid var(--color-primary);
          padding-bottom: 1rem;
          display: inline-block;
          width: 100%;
        }

        .menu-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .menu-list-item {
          margin-bottom: 1.5rem;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.5rem;
          border-bottom: 1px dotted var(--color-border);
        }

        .item-name {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
        }

        .item-price {
          color: var(--color-primary);
          font-weight: 700;
        }

        .item-desc {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
