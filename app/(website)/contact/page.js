'use client'

import Header from "../../../components/website/Header";
import Footer from "../../../components/website/Footer";
import { FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Input from "../../../components/Input";
import TextArea from "../../../components/Input";
import Button from "../../../components/Buttons";
import { FAQComponent, QueryComponent } from "../faq/page";
import { useFeaturedImage } from "../../../hooks/useFetch";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.contact_us})

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          query_type: 'contact_form'
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        toast.success("Thank you! Your message has been sent. We'll reach out within 24 hours.");
        setSent(true);
        setFormData({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error(data.message || 'Something went wrong. Please try again later.');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  useEffect(()=>{
    document.title = 'Contact Us'
  },[])

  return (
    <>
      <Header color={{ desktop: 'black', mobile: 'white' }} fixed={{ desktop: true, mobile: true }} />

      <div className="h-[35vh] lg:h-[60vh] flex items-center justify-center relative overflow-hidden">
        <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
          <Image
            src={featuredImage || IMAGES.hero_bg}
            height={1000}
            width={1000}
            className="absolute top-0 h-full w-full left-0 object-cover"
            alt="Contact India Escapes"
          />
          <div className="relative rounded-3xl w-fit max-w-[80%] flex-center-jc flex-col text-white bg-green/70 text-center p-6 px-12 mt-8 lg:mt-0">
            <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Contact Us</h1>
            <p className="text-sm md:text-base lg:text-lg mt-2">Your India journey starts with a conversation</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-white to-green/5 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Let’s Craft Your Perfect India Escape
                </h2>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                  Questions? Ideas? Ready to book? Our travel experts are available 24/7 to help.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: Mail, title: "Email", value: "sales@indiaescapes.in", href: "mailto:sales@indiaescapes.in" },
                  { icon: Phone, title: "Call / WhatsApp", value: "+91 80910 66115", href: "tel:+918091066115" },
                  { icon: MapPin, title: "Office", value: "Top floor, Verma building, Bhatakuffer bypass, Sanjauli, Shimla - H.P - 171006", href: "#" },
                  { icon: Clock, title: "Hours", value: "Mon–Sat: 9:30 AM – 6:30 PM IST", href: "#" }
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href={item.href}
                    className="block group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-white rounded-3xl shadow-xl p-5 lg:p-6 flex items-start gap-4 hover:shadow-2xl transition-all group-hover:-translate-y-1">
                      <div className="p-3 bg-green/5 rounded-2xl group-hover:bg-green/10 transition-colors">
                        <item.icon className="w-6 h-6 lg:w-7 lg:h-7 text-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm lg:text-base text-gray-600 mt-1 break-words">{item.value}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

            </div>

            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10"
              >
                {!sent ? (
                  <>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                      <Input
                        label="Mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                      <TextArea
                        label="Message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your travel plans..."
                        required
                      />
                      <Button
                        type="submit"
                        disabled={sending}
                        styles="w-full py-4 bg-red hover:bg-black flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        {sending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send size={18} />
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We’ll get back to you within 24 hours.</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-t from-white to-green/5 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w_80_90 items-start">
          <FAQComponent/>
          <QueryComponent/>
        </div>
      </section>
    </>
  );
}