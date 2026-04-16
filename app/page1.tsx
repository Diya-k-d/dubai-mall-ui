"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { text: "Hi! I’m your AI mall assistant. Ask me anything.", sender: "bot" }
  ]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);

  // 🔥 SMART BOT RESPONSES
  const getBotReply = (text: string) => {
    const t = text.toLowerCase();

    if (t.includes("retail") || t.includes("shop")) {
      return "Dubai Mall hosts 1200+ global brands including luxury, fashion, electronics, and flagship stores. Leasing options are tailored to premium brands.";
    }
    if (t.includes("event")) {
      return "From global concerts to brand activations and Dubai Shopping Festival, the mall hosts world-class events attracting millions.";
    }
    if (t.includes("dining") || t.includes("food")) {
      return "Enjoy 200+ dining options including fine dining, cafes, and global cuisines from Michelin-level chefs to casual experiences.";
    }
    if (t.includes("lease")) {
      return "Retail leasing is customized based on brand positioning. Click 'Lease Retail Space' and our team will contact you.";
    }
    if (t.includes("partner")) {
      return "We collaborate with global brands for activations, events, and partnerships. Click 'Partner With Us' to explore opportunities.";
    }

    return "I can help you explore retail, leasing, events, dining, and partnerships at Dubai Mall.";
  };

  // ✅ FIXED MESSAGE HANDLING
  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: getBotReply(text) }
      ]);
      setTyping(false);
    }, 600);
  };

  const handleSend = () => sendMessage(input);

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50 flex justify-between px-8 py-4 bg-black/40 backdrop-blur-md text-white">
        <h1>Dubai Mall</h1>
        <div className="flex gap-6">
          <button onClick={() => document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })}>Why</button>
          <button onClick={() => document.getElementById("retail")?.scrollIntoView({ behavior: "smooth" })}>Retail</button>
          <button onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}>Events</button>
        </div>
      </div>

      {/* HERO */}
      <div className="relative h-screen">
        <video autoPlay loop muted className="absolute w-full h-full object-cover">
          <source src="/mall.mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-6">
          <h1 className="text-6xl font-bold mb-6">The World’s Most Visited Retail Destination</h1>
          <p className="mb-6">Where brands meet millions</p>

          <button
            onClick={() => document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white text-black px-6 py-3 rounded-full"
          >
            Explore →
          </button>
        </div>
      </div>

      {/* WHY */}
      <div id="why" className="bg-black text-white py-24 text-center">
        <h2 className="text-4xl mb-10">Why This Destination</h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {["100M+ Visitors", "1200+ Stores", "5.9M sq ft", "200+ Dining"].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.1 }}
              className="bg-white/10 p-6 rounded-xl"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

      {/* RETAIL */}
      <div id="retail" className="bg-white text-black py-24 px-8">
        <h2 className="text-3xl mb-10">Retail & Luxury Experience</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { img: "/retail1.jpg", title: "Global Luxury Brands" },
            { img: "/retail2.jpg", title: "Immersive Shopping Spaces" },
            { img: "/retail3.jpg", title: "Premium Experience" },
          ].map((item, i) => (
            <div key={i} className="relative group overflow-hidden rounded-xl">
              <img src={item.img} className="h-64 w-full object-cover group-hover:scale-110 transition duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EVENTS */}
      <div id="events" className="bg-black text-white py-24 px-8">
        <h2 className="text-3xl mb-10">Events & Entertainment</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { img: "/event1.jpg", title: "Global Events & Concerts" },
            { img: "/event2.jpg", title: "Brand Activations" },
            { img: "/event3.jpg", title: "Dubai Shopping Festival" },
          ].map((item, i) => (
            <div key={i} className="relative group overflow-hidden rounded-xl">
              <img src={item.img} className="h-64 w-full object-cover group-hover:scale-110 transition duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black text-white py-20 text-center">
        <h2 className="text-4xl mb-6">Join Dubai Mall</h2>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => alert("Redirect to leasing form")}
            className="bg-white text-black px-6 py-3 rounded-full"
          >
            Lease Retail Space
          </button>

          <button
            onClick={() => alert("Redirect to partnership page")}
            className="border px-6 py-3 rounded-full"
          >
            Partner With Us
          </button>
        </div>
      </div>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setOpen(!open)}
          className="bg-white text-black px-4 py-2 rounded-full shadow-lg"
        >
          Ask AI
        </button>

        {open && (
          <div className="mt-2 w-80 h-[420px] bg-black text-white rounded-xl flex flex-col shadow-xl">

            <div className="p-3 border-b font-semibold">AI Assistant</div>

            <div className="p-2 flex flex-wrap gap-2">
              {["Retail", "Events", "Dining", "Leasing"].map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="text-xs bg-white/10 px-2 py-1 rounded">
                  {q}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={m.sender === "user" ? "text-right" : ""}>
                  <span className="bg-white/10 px-2 py-1 rounded inline-block">
                    {m.text}
                  </span>
                </div>
              ))}
              {typing && <p className="text-sm text-gray-400">Typing...</p>}
            </div>

            <div className="flex border-t">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask something..."
                className="flex-1 bg-gray-900 text-white placeholder-gray-400 px-3 py-2 outline-none"
              />

              <button
                onClick={handleSend}
                className="bg-white text-black px-4 hover:bg-gray-200 transition"
              >
                Send
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}