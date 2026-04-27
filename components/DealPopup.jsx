'use client'

import { useEffect, useState } from 'react'
import { DialogContainer } from './Dialog'
import { useFetchList } from '../hooks/useFetch'
import { COLLECTIONS } from '../constants'
import CustomImg from './website/CustomImg'
import Link from 'next/link'
import MultiStepQueryForm from './MSQueryForm'

export default function DealPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [currentDealIndex, setCurrentDealIndex] = useState(0)
  const [activeDeals, setActiveDeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const { loading, list } = useFetchList({ collection_id: COLLECTIONS.DEALS })

  useEffect(() => {
    if (list && list.length > 0) {
      const active = list.filter(deal => deal.active === true && deal.packages?.length > 0 && deal.featured_image !== '')
      const new_array = active.filter(deal => deal.display_in_popup)
      setActiveDeals(new_array || active)
    }
  }, [list])

  useEffect(() => {
    if (activeDeals.length === 0) return

    const initialTimer = setTimeout(() => {
      setShowPopup(true)
      setCurrentDealIndex(0)
    }, 50000)

    const intervalTimer = setInterval(() => {
      setCurrentDealIndex(prev => {
        const nextIndex = (prev + 1) % activeDeals.length
        setShowPopup(true)
        return nextIndex
      })
    }, 1000000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalTimer)
    }
  }, [activeDeals])

  // Reset to deal view whenever the deal rotates
  useEffect(() => {
    setShowForm(false)
  }, [currentDealIndex])

  const handleClose = () => {
    setShowPopup(false)
    setShowForm(false)
  }

  if (loading || activeDeals.length === 0 || !showPopup) return null

  const currentDeal = activeDeals[currentDealIndex]
  if (!currentDeal) return null

  const { featured_image, name, description, url } = currentDeal

  return (
    <DialogContainer onClose={handleClose} containerStyles="md:max-w-[600px]" zIndex={9999}>
      {showForm ? (
        <MultiStepQueryForm destination={name} type="quote" onSave={handleClose} />
      ) : (
        <div className="w-full relative p-4 pt-8 lg:p-8">
          {featured_image && (
            <Link href={`/deals/${url}`}>
              <div className="w-full h-auto max-h-[50vh] object-contain overflow-hidden rounded-t-2xl relative">
                <CustomImg url={featured_image} al={name} styles="w-full h-full object-cover" />
              </div>
            </Link>
          )}

          <div className="pt-6 md:pt-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {name}
            </h2>

            {description && (
              <p className="text-gray-600 text-sm md:text-base mb-2 line-clamp-3">
                {description}
              </p>
            )}

            <button
              className="block w-full text-center bg-red hover:bg-black text-white font-medium py-3 px-4 rounded-full transition-all duration-500 text-sm md:text-lg"
              onClick={() => setShowForm(true)}
            >
              Enquire Now
            </button>
          </div>
        </div>
      )}
    </DialogContainer>
  )
}
