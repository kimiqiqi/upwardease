import React from "react";
import { FeaturedTopic } from "../types";

export const FeaturedTopicCard = ({ topic }: { topic: FeaturedTopic }) => {
  return (
    <div className="bg-gradient-to-br from-eggplant to-teal-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10">
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
          Featured Topic • Week of {topic.weekOf}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{topic.title}</h2>
        <p className="text-lg text-teal-100 max-w-2xl">{topic.prompt}</p>
      </div>
    </div>
  );
};
