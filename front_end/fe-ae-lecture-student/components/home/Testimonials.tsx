"use client";

const plans = [
    {
        name: "Basic",
        price: "$359",
        period: "/Monthly",
        features: [
            "150 HD Videos",
            "10 Category Courses",
            "10 Personal Instructor",
            "Up To 05 Active Members",
            "24/7 Dedicated Support",
            "Unlimited Courses ❌",
        ],
        popular: false,
        image: "https://live.themewild.com/edubo/assets/img/shape/04.png",
    },
    {
        name: "Standard",
        price: "$559",
        period: "/Monthly",
        features: [
            "150 HD Videos",
            "10 Category Courses",
            "10 Personal Instructor",
            "Up To 05 Active Members",
            "24/7 Dedicated Support",
            "Unlimited Courses ✅",
        ],
        popular: true,
        image: "https://live.themewild.com/edubo/assets/img/shape/04.png",
    },
    {
        name: "Premium",
        price: "$959",
        period: "/Monthly",
        features: [
            "150 HD Videos",
            "10 Category Courses",
            "10 Personal Instructor",
            "Up To 05 Active Members",
            "24/7 Dedicated Support",
            "Unlimited Courses ✅",
        ],
        popular: false,
        image: "https://live.themewild.com/edubo/assets/img/shape/04.png",
    },
];

export default function PricingPlanSection() {
    return (
        <section className="relative py-10 bg-center bg-no-repeat bg-cover bg-slate-50">
            <div className="container relative z-10 px-6 mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
                    💡 Pricing Plan
                </div>
                <h2 className="mb-4 text-3xl font-bold md:text-5xl text-slate-800">
                    Let’s Check Our{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                        Pricing Plan
                    </span>
                </h2>

                <div className="grid grid-cols-1 gap-8 mt-20 md:grid-cols-3">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative p-8 rounded-3xl shadow-lg transition-all duration-300 border ${plan.popular
                                    ? "border-indigo-400 scale-105 shadow-2xl"
                                    : "border-transparent hover:-translate-y-2 hover:shadow-xl"
                                }`}
                            style={{
                                backgroundImage: `url(${plan.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        >
                            <div className="absolute -translate-x-1/2 -top-4 left-1/2">
                                <span className="px-5 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-full">
                                    {plan.name}
                                </span>
                            </div>

                            <div className="mt-6 mb-6">
                                <div className="flex items-end justify-center">
                                    <span className="text-5xl font-bold text-indigo-900">
                                        {plan.price}
                                    </span>
                                    <span className="ml-1 text-lg font-medium text-indigo-600">
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <button className="w-full mt-2 mb-12 font-medium text-white transition shadow-md btn btn-gradient bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:opacity-90">
                                Subscribe Now →
                            </button>

                            <ul className="space-y-8 text-left">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center gap-3 text-[#000D83] font-bold"
                                    >
                                        {feature.includes("❌") ? (
                                            <span className="text-red-500">✗</span>
                                        ) : (
                                            <span className="text-green-500">✓</span>
                                        )}
                                        <span className="text-sm md:text-base">
                                            {feature.replace("✅", "").replace("❌", "")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
