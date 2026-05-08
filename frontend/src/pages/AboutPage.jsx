import { motion } from 'framer-motion';
import { Heart, Shield, Users, Target, Award, BookOpen } from 'lucide-react';

const AboutPage = () => {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-white mb-4">About CampusFund</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              A secure campus fundraising and donation management system designed to provide
              financial and emergency assistance to students in need.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                CampusFund was created to bridge the gap between students facing financial difficulties
                and compassionate donors willing to help. We believe that no student should have to
                abandon their education due to financial constraints.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our platform provides a secure, transparent, and efficient way to connect students
                in need with donors who want to make a meaningful impact. Every donation goes directly
                to supporting students' educational journeys.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Secure', desc: 'Bank-grade security' },
                { icon: Users, label: 'Community', desc: 'Supportive network' },
                { icon: Target, label: 'Targeted', desc: 'Direct impact' },
                { icon: Award, label: 'Trusted', desc: 'Verified students' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center"
                >
                  <item.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800">{item.label}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'For Students', desc: 'Submit financial assistance requests, upload supporting documents, track your request status, and receive support from verified donors.' },
              { icon: Heart, title: 'For Donors', desc: 'Browse active campaigns, donate securely via Paystack, track your donation impact, and download receipts for your records.' },
              { icon: Shield, title: 'Secure Platform', desc: 'JWT authentication, encrypted transactions, verified users, and comprehensive audit trails ensure your safety and privacy.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 card-hover shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
