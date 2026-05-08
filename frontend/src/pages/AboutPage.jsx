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
              A structured financial assistance and emergency support channel for students within the campus community, with verified disbursement tracking and contributor accountability.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Purpose</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                CampusFund provides a structured pathway for students facing verified financial hardship to receive targeted assistance. The platform ensures that all requests are reviewed, all contributions are tracked, and all disbursements are accounted for.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Contributors fund reviewed and approved requests through a transparent process. Every transaction is recorded, auditable, and tied to a verified student need.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Secure', desc: 'Encrypted transactions' },
                { icon: Users, label: 'Verified', desc: 'Identity-confirmed users' },
                { icon: Target, label: 'Accountable', desc: 'Tracked disbursements' },
                { icon: Award, label: 'Reviewed', desc: 'Admin-verified requests' },
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
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'For Students', desc: 'Submit documented assistance requests, upload supporting evidence, track review status, and receive disbursed funds upon approval.' },
              { icon: Heart, title: 'For Contributors', desc: 'Review verified campaigns, contribute through a secure payment gateway, track contribution history, and access transaction records.' },
              { icon: Shield, title: 'Platform Integrity', desc: 'Token-based authentication, encrypted payment processing, verified user accounts, and comprehensive audit logs for all administrative actions.' },
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
