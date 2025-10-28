"use client";

const categories = [
  { name: "Marketing", img: "/cat1.jpg", courses: 24 },
  { name: "Design", img: "/cat2.jpg", courses: 18 },
  { name: "Programming", img: "/cat3.jpg", courses: 30 },
  { name: "Photography", img: "/cat4.jpg", courses: 15 },
];

export default function CategorySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-800">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((c, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl shadow-md group"
            >
              <img
                src={c.img}
                alt={c.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-sm">{c.courses} Courses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
