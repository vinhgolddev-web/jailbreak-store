import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const GachaCaseList = memo(({ cases, onSelect }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cases.map((c) => (
                <motion.div
                    key={c._id}
                    whileHover={{ y: -5 }}
                    className="glass rounded-3xl p-6 cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden"
                    onClick={() => onSelect(c)}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-full aspect-square mb-4">
                        <Image
                            src={c.image}
                            alt={c.name}
                            fill
                            className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2 group-hover:text-primary transition-colors">{c.name}</h3>
                    <div className="text-center">
                        <span className="inline-block bg-primary text-black font-bold px-4 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(255,159,10,0.4)]">
                            {(c.price || 0).toLocaleString()} VNĐ
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
});

GachaCaseList.displayName = 'GachaCaseList';
export default GachaCaseList;
