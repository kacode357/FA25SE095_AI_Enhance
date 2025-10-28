"use client";

const testimonials = [
    {
        name: "Emily Carter",
        role: "Marketing Student",
        quote:
            "Edubo has transformed how I learn! The instructors are amazing and the platform is super intuitive.",
        img: "/student1.jpg",
    },
    {
        name: "Daniel Kim",
        role: "Data Analyst",
        quote:
            "I got my certification within weeks and landed a better job thanks to Edubo’s analytics courses!",
        img: "/student2.jpg",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-800">
                    What Our Students Say
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl bg-gray-50 shadow-md hover:shadow-lg transition text-left"
                        >
                            <p className="text-slate-600 italic mb-6">“{t.quote}”</p>
                            <div className="flex items-center gap-4">
                                <img
                                    src={t.img}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-slate-900">{t.name}</h4>
                                    <p className="text-sm text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
