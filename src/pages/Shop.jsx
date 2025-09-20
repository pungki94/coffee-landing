import React from "react";
import CoffeeCard from "../components/CoffeeCard";
const coffeeProducts = [
  {
    id: 1,
    name: "Ethiopian Yirgacheffe",
    description: "Floral and citrus notes with a bright finish.",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Colombian Supremo",
    description: "Rich and smooth with chocolate undertones.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Sumatra Mandheling",
    description: "Earthy and full-bodied with low acidity.",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
  },
];

function Shop() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-center">Our Coffee Selection</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {coffeeProducts.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>
    </section>
  );
}
export default Shop;
