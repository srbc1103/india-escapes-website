'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Input, { PhoneNumberInput, DatePicker, TextArea } from "./Input"
import Button from "./Buttons"
import { toast } from "sonner"
import { LoaderCircle, ChevronLeft, ChevronRight, CalendarIcon, Users, DollarSign, Star, Heart, Bed, Clock, Check } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const currentYear = new Date().getFullYear()
const years = [currentYear, currentYear + 1]

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  })
}

export default function MultiStepQueryForm({ destination = "", type = "quote", onSave }) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitted,setSubmitted] = useState(false)

  const [state, setState] = useState({
    name: "",
    email: "",
    mobile: "",
    destination: destination || "",
    message: "",
    query_type: "ms_form",

    travelDateType: "",
    fixedDate: null,
    flexibleMonths: [],
    duration: "",
    travellers: "",
    accommodation: [],
    budget: "",
    interests: ""
  })

  const totalSteps = 7

  const nextStep = () => {
    if (step < totalSteps) {
      setDirection(1)
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        if (state.travelDateType === "Fixed") return state.fixedDate
        if (state.travelDateType === "Flexible") return state.flexibleMonths.length > 0
        return false
      case 2:
        return state.duration !== ""
      case 3:
        return state.travellers !== ""
      case 4:
        return state.accommodation.length > 0
      case 5:
        return state.budget !== ""
      case 6:
        return true // Interests optional
      case 7:
        return state.name && state.mobile
      default:
        return true
    }
  }

  const toggleMonth = (month) => {
    setState(prev => ({
      ...prev,
      flexibleMonths: prev.flexibleMonths.includes(month)
        ? prev.flexibleMonths.filter(m => m !== month)
        : [...prev.flexibleMonths, month]
    }))
  }

  const toggleAccommodation = (option) => {
    setState(prev => {
      if (prev.accommodation.includes(option)) {
        return { ...prev, accommodation: prev.accommodation.filter(a => a !== option) }
      } else if (prev.accommodation.length < 2) {
        return { ...prev, accommodation: [...prev.accommodation, option] }
      }
      return prev
    })
  }

  async function handleSubmit() {
    setSaving(true)
    const res1 = await fetch('/api/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    const res = await fetch('/api/query-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    const data = await res.json()
    if (data.status === 'success') {
      toast.success("We've received your request. Our travel experts will craft your perfect India escape soon!")
      setSubmitted(true)
      setTimeout(()=>{
        onSave()
      },4000)
    } else {
      toast.error(data.message || 'Something went wrong. Please try again later.')
    }
    setSaving(false)
  }

  const progress = (step / totalSteps) * 100

  return (
    <div className="w-full py-4 pt-12 md:py-8 h-[90vh] bg-white dark:bg-gray-900 rounded-2xl">
      {!submitted ? <div className="w-full mx-auto flex flex-col justify-between items-center h-full">
        <div className="w-full">
            <div className="text-center">
            <h2 className="font-light text-xl md:text-2xl">
                Plan Your <span className="text-green font-semibold">Dream India Escape!</span>
            </h2>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of {totalSteps}</p> */}
            </div>
            <div className="my-2 w-[90%] md:w-[80%] mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden shadow-inner">
                <motion.div
                    className="h-full bg-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>
        </div>

        <div className="relative h-[76%] overflow-y-auto w-full overflow-x-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full"
            >
              {step === 1 && (
                <div className="">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CalendarIcon className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Your preferred travel dates?</h3>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">Select your preferred travel dates</p> */}

                  <div className="grid grid-cols-2 gap-4 mx-auto w-[90%] md:w-[80%] mb-8">
                    {["Fixed", "Flexible"].map((opt, index) => (
                      <motion.button
                        key={opt}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        // transition={{ delay: 0.05 * index, type: "spring" }}
                        onClick={() => {
                          let fixedDate = index == 0 ? state.fixedDate : null
                          let flexibleMonths = index == 1 ? state.flexibleMonths : []
                          setState(prev => ({ ...prev, travelDateType: index == 0 ? 'Fixed' : 'Flexible',flexibleMonths,fixedDate }))
                        }}
                        className={`p-3 rounded-full border-2 font-medium transition-all duration-300 shadow-sm hover:shadow-lg  ${
                          state.travelDateType === opt
                            ? "border-red bg-red text-white shadow-red/30"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-base">{opt}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="w-[90%] md:w-[80%] mx-auto">
                    {state.travelDateType == 'Fixed' && <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-left">Select Arrival Date</p>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-left"
                      >
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={state.fixedDate}
                          onSelect={(date)=>setState(s=>({...s,fixedDate:date}))}
                          fromDate={new Date()}
                          className="w-full data-[selected-single=true]:bg-red"
                        />
                      </motion.div>
                    </>}
                    {state.travelDateType == 'Flexible' && <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-left">Select travel months</p>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 grid grid-cols-3 gap-2 text-sm"
                    >
                      {months.map((month, index) => (
                        <motion.button
                          key={month}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * index }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMonth(month)
                          }}
                          className={`py-3 px-2 rounded-xl font-medium transition-all duration-200 ${
                            state.flexibleMonths.includes(month)
                              ? "bg-red text-white shadow-md "
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {month.slice(0, 3)}
                        </motion.button>
                      ))}
                    </motion.div>
                    </>}
                  </div>
                  {/* <div className="grid grid-cols-1 gap-5 max-w-lg mx-auto">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <button
                        onClick={() => setState(prev => ({ ...prev, travelDateType: "fixed" }))}
                        className={`w-full p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg ${
                          state.travelDateType === "fixed"
                            ? "border-red bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 shadow-red/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-lg">Fixeds</p>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            state.travelDateType === "fixed" ? "border-red bg-red" : "border-gray-300"
                          }`}>
                            {state.travelDateType === "fixed" && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-left">I have specific travel dates in mind</p>

                        {state.travelDateType === "fixed" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-left"
                          >
                            <DatePicker
                              label="Travel Date"
                              selectedDate={state.fixedDate ? new Date(state.fixedDate) : null}
                              onDateSelect={(date) => setState(prev => ({ ...prev, fixedDate: date ? date.toISOString().split('T')[0] : null }))}
                              minDate={new Date().toISOString().split('T')[0]}
                            />
                          </motion.div>
                        )}
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button
                        onClick={() => setState(prev => ({ ...prev, travelDateType: "flexible" }))}
                        className={`w-full p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg ${
                          state.travelDateType === "flexible"
                            ? "border-red bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 shadow-red/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-lg">Flexible Dates</p>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            state.travelDateType === "flexible" ? "border-red bg-red" : "border-gray-300"
                          }`}>
                            {state.travelDateType === "flexible" && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-left">I'm flexible with my travel months</p>

                        {state.travelDateType === "flexible" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 grid grid-cols-3 gap-2 text-sm"
                          >
                            {months.map((month, index) => (
                              <motion.button
                                key={month}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.05 * index }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleMonth(month)
                                }}
                                className={`py-3 px-2 rounded-xl font-medium transition-all duration-200 ${
                                  state.flexibleMonths.includes(month)
                                    ? "bg-red text-white shadow-md "
                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                              >
                                {month.slice(0, 3)}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  </div> */}
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Clock className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Duration of your trip?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">How long do you plan to stay?</p>

                  <div className="grid grid-cols-2 gap-4 mx-auto w-[90%] md:w-[80%]">
                    {["3 - 5 days", "5 - 9 days", "9 - 14 days", "14+ days"].map((opt, index) => (
                      <motion.button
                        key={opt}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        // transition={{ delay: 0.05 * index, type: "spring" }}
                        onClick={() => setState(prev => ({ ...prev, duration: opt }))}
                        className={`p-3 rounded-full border-2 font-medium transition-all duration-300 shadow-sm hover:shadow-lg  ${
                          state.duration === opt
                            ? "border-red bg-red text-white shadow-red/30"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-base">{opt}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Users className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Who are you travelling with?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Select your travel companions</p>

                  <div className="space-y-3 mx-auto w-[90%]">
                    {["Planning solo", "Planning with partner", "Planning with family or friends", "Group of 8 or more people"].map((opt, index) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setState(prev => ({ ...prev, travellers: opt }))}
                        className={`w-full py-5 px-6 md:px-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-sm hover:shadow-lg ${
                          state.travellers === opt
                            ? "border-red bg-red shadow-red/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{opt}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            state.travellers === opt ? "border-red bg-red" : "border-gray-300"
                          }`}>
                            {state.travellers === opt && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Bed className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">
                    Preferred accommodation type
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Select up to 2 accommodation preferences</p>

                  <div className="space-y-3 mx-auto w-[90%]">
                    {[
                      { label: "Luxury (5 Star)", icon: "⭐⭐⭐⭐⭐", desc: "Premium hotels and resorts" },
                      { label: "Comfortable (4 Star)", icon: "⭐⭐⭐⭐", desc: "Quality hotels with great amenities" },
                      { label: "Economical (3 Star)", icon: "⭐⭐⭐", desc: "Budget-friendly comfortable stays" }
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => toggleAccommodation(item.label)}
                        className={`w-full py-5 px-6 md:px-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-sm hover:shadow-lg ${
                          state.accommodation.includes(item.label)
                            ? "border-red bg-red shadow-red/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex flex-col md:flex-row items-start md:items-center md:gap-2 mb-1">
                              <span className="block md:inline">{item.icon}</span>
                              <span className="font-semibold">{item.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            state.accommodation.includes(item.label) ? "border-red bg-red" : "border-gray-300"
                          }`}>
                            {state.accommodation.includes(item.label) && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <DollarSign className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Budget per person</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Select your approximate budget range</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto w-[90%]">
                    {["Less than $1000", "$1000 - $2000", "$2000 - $4000", "More than $4000"].map((opt, index) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index, type: "spring" }}
                        onClick={() => setState(prev => ({ ...prev, budget: opt }))}
                        className={`p-4 rounded-2xl border-2 font-semibold transition-all duration-300 shadow-sm hover:shadow-lg ${
                          state.budget === opt
                            ? "border-red bg-red text-white shadow-red/30 "
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Heart className="mx-auto mb-4 text-green drop-shadow-md" size={56} />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Any special interests?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Tell us about your interests (optional)</p>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-lg mx-auto"
                  >
                    <div className="relative mx-auto w-[90%]">
                      <textarea
                        rows={5}
                        placeholder="e.g., Adventure, Wildlife, Yoga & Wellness, Heritage, Food tours, Honeymoon, Photography..."
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all duration-300 shadow-sm"
                        value={state.interests}
                        onChange={(e) => setState(prev => ({ ...prev, interests: e.target.value }))}
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                        {state.interests.length} characters
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {step === 7 && (
                <div>
                  <div className="text-center mb-4">
                    {/* <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-16 h-16 bg-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <Check className="text-white" size={32} />
                    </motion.div> */}
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">Almost there!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share your contact details to receive your personalized itinerary</p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 gap-5 max-w-lg mx-auto w-[90%]"
                  >
                    <Input
                      label="Name"
                      initialFocus
                      value={state.name}
                      onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                    <PhoneNumberInput
                      label="Mobile"
                      val={state.mobile}
                      fun={(val) => setState(prev => ({ ...prev, mobile: val }))}
                      placeholder="Your mobile number"
                    />
                    <Input
                      label="Email (Optional)"
                      value={state.email}
                      onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                    <TextArea rows={3} label="Additional Message (Optional)" value={state.message} onChange={(e)=>setState(state=>({...state,message:e.target.value}))} placeholder="Any additional message or requirements..."/>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-center-jc gap-2">
          <Button
            onClick={prevStep}
            disabled={step === 1}
            styles="px-5 md:px-7 py-3 md:py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow font-medium"
          >
            <ChevronLeft size={20} /> <span className="hidden md:inline">Previous</span>
          </Button>

          {step === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || saving}
              styles="px-6 md:px-10 py-3 md:py-4 bg-red text-white rounded-full hover:from-red/90 hover:to-orange-500/90 flex items-center gap-2 justify-center transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoaderCircle className="animate-spin" size={20} />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <ChevronRight size={20} />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              styles="px-6 md:px-10 py-3 md:py-4 bg-red text-white rounded-full hover:from-red/90 hover:to-orange-500/90 flex items-center gap-2 justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm md:text-base"
            >
              <span>Continue</span>
              <ChevronRight size={20} />
            </Button>
          )}
        </div>
      </div> : <>
        <AnimatePresence mode="wait" custom={direction}>
          <div className="flex-center-jc flex-1 text-center flex-col h-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-40 h-40 bg-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Check className="text-white" size={400} />
            </motion.div>
            <h3 className="text-6xl font-semibold mb-2">Success!</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 w-[80%]">We've received your query. We'll get back to you ASAP!</p>
          </div>
        </AnimatePresence>
      </>}
    </div>
  )
}