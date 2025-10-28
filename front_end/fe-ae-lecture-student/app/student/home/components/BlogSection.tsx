"use client";

const blogs = [
    {
        title: "5 Ways to Stay Motivated While Learning Online",
        img: "/blog1.jpg",
        date: "Oct 15, 2025",
    },
    {
        title: "Top 10 Marketing Tools You Should Know",
        img: "/blog2.jpg",
        date: "Oct 20, 2025",
    },
    {
        title: "How to Balance Work and Study Effectively",
        img: "/blog3.jpg",
        date: "Oct 25, 2025",
    },
];

export default function BlogSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-800">
                    Latest From Our Blog
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blogs.map((b, i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-xl transition"
                        >
                            <img src={b.img} alt={b.title} className="w-full h-48 object-cover" />
                            <div className="p-6 text-left">
                                <p className="text-sm text-violet-600 font-medium mb-2">{b.date}</p>
                                <h3 className="font-semibold text-lg text-slate-900">{b.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
