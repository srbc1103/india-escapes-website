'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { LoaderCircle, ChevronLeft, ChevronRight, Plus, Trash2, Users, Calendar, FileText, Globe, Shield, DollarSign, Check } from "lucide-react"

import Input, { PhoneNumberInput } from "../../../components/Input"
import Button from "../../../components/Buttons"
import Header from "../../../components/website/Header"
import Link from "next/link"

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeInOut" }
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.35, ease: "easeInOut" }
  })
}

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(()=>{
    document.title = 'Booking Form - India Escapes'
  },[])

  const totalSteps = 8

  const [passengers, setPassengers] = useState([
    { title: "Mr", firstName: "", middleName: "", lastName: "", dob: "", placeOfBirth: "", nationality: "Indian", passportNumber: "", issueDate: "", expiryDate: "" }
  ])

  const [state, setState] = useState({
    bookingRef: "",
    salesPOC: "",
    tourStartDate: "",

    leadTitle: "Mr",
    leadFirstName: "",
    leadMiddleName: "",
    leadLastName: "",
    leadAddress: "",
    leadTelephone: "",
    leadEmail: "",

    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    emergencyAltPhone: "",

    arrivalDate: "",
    returnDate: "",
    adults: "",
    kids: "",
    infants: "",
    rooms: "",
    destinations: "",

    insuranceCompany: "",
    policyNumber: "",
    insurancePhone: "",

    totalPackageCost: "",
    currency: "INR",
    advancePaidAmount: "",
    advancePaidDate: "",
  })

  const addPassenger = () => {
    setPassengers([...passengers, {
      title: "Mr", firstName: "", middleName: "", lastName: "", dob: "",
      placeOfBirth: "", nationality: "Indian", passportNumber: "", issueDate: "", expiryDate: ""
    }])
  }

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const nextStep = () => {
    setDirection(1)
    setStep(s => Math.min(s + 1, totalSteps))
  }

  const prevStep = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  const isStepValid = () => {
    switch (step) {
      case 1: return state.bookingRef && state.salesPOC && state.tourStartDate
      case 2: return state.leadFirstName && state.leadLastName && state.leadTelephone && state.leadEmail
      case 3: return passengers.every(p => p.firstName && p.dob)
      case 4: return state.emergencyName && state.emergencyPhone
      case 5: return state.arrivalDate && state.returnDate && state.adults && state.rooms
      case 6: return true // Insurance is optional
      case 7: return true // Payment details are optional
      case 8: return termsAccepted
      default: return true
    }
  }

  const handleSubmit = async () => {
    if (!termsAccepted) return toast.error("Please accept terms & conditions")

    setSaving(true)
    const payload = { ...state, passengers, query_type: "booking_form" }

    try {
      const res = await fetch('/api/booking-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.status === 'success') {
        toast.success("Booking form submitted successfully! We'll contact you shortly.")
        setSubmitted(true)
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (err) {
      toast.error("Failed to submit. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const progress = (step / totalSteps) * 100

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-t from-red-50/50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold"><span className="text-red">Booking</span> Form</h1>
          <p className="text-xs md:text-base text-gray-400  mt-2">Secure your dream India escape with all details</p>
        </div>

        {!submitted ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-300 overflow-hidden">
            <div className="p-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div className="h-full bg-red" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <p className="text-center mt-3 text-sm text-gray-500">Step {step} of {totalSteps}</p>
            </div>

            <div className="relative min-h-[600px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 p-6 pt-0"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-center"><FileText className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Basic Booking Details</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input label="Booking Reference Code" value={state.bookingRef} onChange={e => setState(s => ({ ...s, bookingRef: e.target.value }))} placeholder="e.g. IND2025-001" />
                        <Input label="Sales POC" value={state.salesPOC} onChange={e => setState(s => ({ ...s, salesPOC: e.target.value }))} placeholder="Name of your travel advisor" />
                        <div className="md:col-span-2">
                          <Input type="date" label="Tour Start Date" value={state.tourStartDate} onChange={e => setState(s => ({ ...s, tourStartDate: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center"><Users className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Lead Traveler Details</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input label="First Name" value={state.leadFirstName} onChange={e => setState(s => ({ ...s, leadFirstName: e.target.value }))} />
                        <Input label="Last Name" value={state.leadLastName} onChange={e => setState(s => ({ ...s, leadLastName: e.target.value }))} />
                        <div className="md:col-span-2"><Input label="Address" value={state.leadAddress} onChange={e => setState(s => ({ ...s, leadAddress: e.target.value }))} /></div>
                        <PhoneNumberInput label="Contact Number" val={state.leadTelephone} fun={v => setState(s => ({ ...s, leadTelephone: v }))} />
                        <Input label="Email" value={state.leadEmail} onChange={e => setState(s => ({ ...s, leadEmail: e.target.value }))} type="email" />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8 h-full overflow-y-auto">
                      <div className="text-center"><Globe className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">All Passengers (Including Lead)</h2>
                      {passengers.map((p, i) => (
                        <div key={i} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative">
                          {i > 0 && <Button onClick={() => removePassenger(i)} styles="absolute top-4 right-4 bg-red/10 text-red hover:bg-red hover:text-white"><Trash2 size={18} /></Button>}
                          <h3 className="font-semibold mb-4 text-lg">Passenger {i + 1} {i === 0 && "(Lead)"}</h3>
                          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
                            <select className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600" value={p.title} onChange={e => updatePassenger(i, "title", e.target.value)}>
                              {["Mr", "Ms", "Mrs", "Dr", "Master", "Miss"].map(t => <option key={t}>{t}</option>)}
                            </select>
                            <Input placeholder="First Name" value={p.firstName} onChange={e => updatePassenger(i, "firstName", e.target.value)} />
                            <Input placeholder="Last Name" value={p.lastName} onChange={e => updatePassenger(i, "lastName", e.target.value)} />
                            <Input type="date" label="Date of Birth" value={p.dob} onChange={e => updatePassenger(i, "dob", e.target.value)} />
                            <Input label="Place of Birth" placeholder="Place of Birth" value={p.placeOfBirth} onChange={e => updatePassenger(i, "placeOfBirth", e.target.value)} />
                            <Input label="Nationality" placeholder="Nationality" value={p.nationality} onChange={e => updatePassenger(i, "nationality", e.target.value)} />
                            <Input label="Passport/Aadhaar Number" placeholder="Passport/Aadhaar Number" value={p.passportNumber} onChange={e => updatePassenger(i, "passportNumber", e.target.value)} />
                            <Input type="date" label="Issue Date" value={p.issueDate} onChange={e => updatePassenger(i, "issueDate", e.target.value)} />
                            <Input type="date" label="Expiry Date" value={p.expiryDate} onChange={e => updatePassenger(i, "expiryDate", e.target.value)} />
                          </div>
                        </div>
                      ))}
                      <Button onClick={addPassenger} styles="w-full py-4 border-2 border-dashed bg-gray-100 border-red/50 text-red hover:bg-red hover:text-white flex-center-jc gap-2">
                        <Plus size={24} /> Add Another Passenger
                      </Button>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center"><Shield className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Emergency Contact</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input label="Name" value={state.emergencyName} onChange={e => setState(s => ({ ...s, emergencyName: e.target.value }))} />
                        <Input label="Relationship" value={state.emergencyRelation} onChange={e => setState(s => ({ ...s, emergencyRelation: e.target.value }))} />
                        <PhoneNumberInput label="Contact Number" val={state.emergencyPhone} fun={v => setState(s => ({ ...s, emergencyPhone: v }))} />
                        <PhoneNumberInput label="Alternative Phone" val={state.emergencyAltPhone} fun={v => setState(s => ({ ...s, emergencyAltPhone: v }))} />
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-6">
                      <div className="text-center"><Calendar className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Trip Details</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input type="date" label="Arrival Date" value={state.arrivalDate} onChange={e => setState(s => ({ ...s, arrivalDate: e.target.value }))} />
                        <Input type="date" label="Return Date" value={state.returnDate} onChange={e => setState(s => ({ ...s, returnDate: e.target.value }))} />
                        <Input label="Adults (Above 11 yrs)" value={state.adults} onChange={e => setState(s => ({ ...s, adults: e.target.value }))} type="number" min={1}/>
                        <Input label="Kids (2-11 yrs)" value={state.kids} onChange={e => setState(s => ({ ...s, kids: e.target.value }))} type="number" min={0}/>
                        <Input label="Infants (0-2 yrs)" value={state.infants} onChange={e => setState(s => ({ ...s, infants: e.target.value }))} type="number" min={0}/>
                        <Input label="Rooms Required" value={state.rooms} onChange={e => setState(s => ({ ...s, rooms: e.target.value }))} type="number" min={1}/>
                        <div className="md:col-span-2"><Input label="Tour Destinations" value={state.destinations} onChange={e => setState(s => ({ ...s, destinations: e.target.value }))} placeholder="e.g. Delhi, Agra, Jaipur, Kerala" /></div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8">
                      <div className="text-center"><Shield className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Travel Insurance (Optional)</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input label="Insurance Company" value={state.insuranceCompany} onChange={e => setState(s => ({ ...s, insuranceCompany: e.target.value }))} placeholder="e.g. ICICI Lombard" />
                        <Input label="Policy Number" value={state.policyNumber} onChange={e => setState(s => ({ ...s, policyNumber: e.target.value }))} placeholder="Policy number" />
                        <PhoneNumberInput label="Insurance Contact" val={state.insurancePhone} fun={v => setState(s => ({ ...s, insurancePhone: v }))} />
                      </div>
                    </div>
                  )}

                  {step === 7 && (
                    <div className="space-y-8">
                      <div className="text-center"><DollarSign className="mx-auto text-red" size={48} /></div>
                      <h2 className="text-2xl font-semibold text-center">Payment Details (Optional)</h2>
                      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <Input label="Total Package Cost" value={state.totalPackageCost} onChange={e => setState(s => ({ ...s, totalPackageCost: e.target.value }))} placeholder="e.g. ₹150,000" />
                        <div>
                          <label className="block text-sm font-medium mb-2">Currency</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            value={state.currency}
                            onChange={e => setState(s => ({ ...s, currency: e.target.value }))}
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="ZAR">ZAR (R)</option>
                          </select>
                        </div>
                        <Input label="Advance Paid Amount" value={state.advancePaidAmount} onChange={e => setState(s => ({ ...s, advancePaidAmount: e.target.value }))} placeholder="e.g. ₹50,000" />
                        <Input type="date" label="Advance Paid Date" value={state.advancePaidDate} onChange={e => setState(s => ({ ...s, advancePaidDate: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {step === 8 && (
                    <div className="text-center space-y-8 py-12">
                      <h2 className="text-3xl font-bold">Review & Submit</h2>
                      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        By submitting this form, you agree to our <Link href="/tnc.pdf" target="_blank" className="text-red underline">Terms & Conditions</Link> and <Link target="_blank" href="/privacy-policy" className="text-red underline">Privacy Policy</Link>.
                      </p>
                      <label className="flex items-center justify-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="w-6 h-6 text-red rounded" />
                        <span className="text-lg">I accept the terms and conditions</span>
                      </label>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex-center-jc gap-2 p-6 bg-gray-50 dark:bg-gray-800">
              <Button onClick={prevStep} disabled={step === 1 || saving} styles="p-4 md:px-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2">
                <ChevronLeft size={20} /> Previous
              </Button>

              {step === totalSteps ? (
                <Button onClick={handleSubmit} disabled={!isStepValid() || saving || !termsAccepted} styles="p-4 md:px-12 bg-red text-white rounded-xl hover:bg-red/90 flex items-center gap-2 shadow-lg">
                  {saving ? <><LoaderCircle className="animate-spin" /> Submitting...</> : <><Check size={24} /> Submit Booking</>}
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={!isStepValid()} styles="p-4 md:px-12 bg-red text-white rounded-xl hover:bg-red/90 flex items-center gap-3 shadow-lg">
                  Continue <ChevronRight size={20} />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-red rounded-full flex-center-jc mx-auto mb-8">
              <Check className="text-white" size={80} />
            </div>
            <h2 className="text-4xl font-bold mb-4">Booking Submitted Successfully!</h2>
            <p className="text-xl text-gray-600">Our team will contact you shortly to confirm your India escape.</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}