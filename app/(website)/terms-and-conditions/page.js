'use client'

import Footer from "../../../components/website/Footer";
import Header from "../../../components/website/Header";
import { FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants";
import Image from "next/image";
import { useFeaturedImage } from "../../../hooks/useFetch";
import { useEffect } from "react";

export default function Page() {
  const { featuredImage } = useFeaturedImage({ id: FEATURED_IMAGE_PAGE_MAP.tnc });
  useEffect(()=>{
    document.title = 'Terms & Conditions - India Escapes'
  },[])
  return (
    <>
      <Header color={{desktop:'black', mobile:'white'}} fixed={{desktop:true,mobile:true}}/>
      
      {/* Hero Banner */}
      <div className="h-[35vh] lg:h-[60vh] flex items-center justify-center relative">
        <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex items-center justify-center lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20 bg-black">
          <Image 
            src={featuredImage || IMAGES.hero_bg} 
            height={1000} 
            width={1000} 
            className="absolute top-0 h-full w-full left-0 object-cover opacity-90 lg:opacity-100" 
            alt="India Escapes - Terms & Conditions" 
          />
            <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Terms & Conditions</h1>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12 lg:py-20">
        <div className="w_80_90 px-4 lg:px-8 space-y-8">

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              On confirmation of booking your contract is with India Escapes. A contract exists between us when we confirm your tour/travel services and have received the deposit amount from your end.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              To confirm your reservation, a minimum of 40% advance payment is required at the time of booking. The remaining balance must be paid 30 days before your scheduled travel date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              If your tour is cancelled due to government travel restrictions, your deposit and any progress payments will be carried forward as full credit towards future travel with us with Zero fees.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              In case of cancellation of tour/travel services due to any avoidable/unavoidable reason/s we must be informed in writing. Cancellation charges would be effective from the date we receive letter in writing and cancellation charges calculated on total land package cost would be as follows:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li className="text-sm lg:text-base">Cancellations made 45 days or more before the travel date: 85% refund (15% cancellation fee applies).</li>
              <li className="text-sm lg:text-base">Cancellations made between 15 to 44 days before the travel date: 50% refund.</li>
              <li className="text-sm lg:text-base">Cancellations made between 7 to 14 days before the travel date: 20% refund.</li>
              <li className="text-sm lg:text-base">Cancellations made within 7 days or in the event of a no-show: No refund.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4 italic">
              Note: Apart from above, in case of bookings for special train journeys, hotel or resort bookings during the peak season (X-Mas, Holi, New Year, Pushkar Fair, Diwali etc) full payment is required to be made at the time of booking itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Terms:</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">Jungle safari charges are non-refundable.</p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-2">Bookings for blackout dates (New Year and Christmas week) are non-refundable.</p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-2">Domestic flights are partially refundable, subject to airline policies.</p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-2">Cancellation and rebooking policies are only valid for land part of tour not Safari Tickets, International and domestic airline tickets and train tickets.</p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              International, domestic airline tickets and train tickets are subject to full payment at the time of booking and are subject to respective airline and train operators policies for booking, rebooking and cancellation.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              If this balance is not paid on or before the due date, we reserve the right to treat your booking as cancelled and your booking will be treated according to our cancellation policy. Once you submit the advance payment, we would keep you updated of your travel arrangements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Methods:</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base"><strong>Credit/Debit Card:</strong> A 3.5% payment gateway fee will be applied to the total amount.</p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-2"><strong>Wire Transfer:</strong> The sender is responsible for all associated wire transfer fees.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Train & Flight, Safari etc</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              For Safari, Train Booking and Flights additional activities that are booked in advance there will not be any refund if you change the date of tour.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              In case of Train journey and flights if seats are not get confirmed or Train/ Flights got cancelled due to any reason best possible alternative transportation will be provided at additional cost. For any changes in Tour Programme India Escapes has right not to give any compensation and Refund to travelers
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              You are responsible for checking in flights at correct time and for presenting yourself to take up all pre booked components of your arrangements. India Escapes cannot accept the responsibility for client missing flight as a result of late check in and no credit or refunds will be given if you fail to take up any component of your travel arrangements. No credit or refunds will be given for lost, mislaid or destroyed travel documents..
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              Our Packages does not include Domestic flight and International flight that will be on additional cost
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              Airfare is dynamic and subject to change with prior information which is non transferable and non refundable
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please Note:-</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li className="text-sm lg:text-base">In case you cancel the trip after commencement there would be no refund possible and for unused hotel accommodation, chartered transportation and missed meals etc. we do not bear any responsibility to refund.</li>
              <li className="text-sm lg:text-base">In case of special train journey (like Palace on Wheels, Royal Rajasthan on Wheels, Deccan Odyssey, Golden Chariot, Indian Maharaja & Maharajas Express) – a separate cancellation policy is applicable (which would be advised as and when required).</li>
              <li className="text-sm lg:text-base">Please note that if booking for following period is/are cancelled, due to whatsoever reason, no refund would be made for said cancellation.</li>
              <li className="text-sm lg:text-base">High Peak Season bookings (from 20th Dec to 15th Jan)</li>
              <li className="text-sm lg:text-base">Festival Period Bookings (Festivals like -Diwali, Duseera, Holi, Pushkar fair etc).</li>
              <li className="text-sm lg:text-base">Long Weekends Bookings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking amendments</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              We do not encourage changes in the confirmed arrangements. But if you do need to make amendments in the arrangements already confirmed, we will do all possible to accommodate the changes, depending on the availability of various segments of the tour, for the new requirements. However, the changes will be subject to certain minimum amendment / administration charges.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4 italic">
              Note: Cancellation, Changes or Refund regarding both international and domestic airline tickets is subject to respective airline policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unused Services</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              · In regards to refund of unused / unutilized services during the tour or before the tour there will be no refund by India Escapes or by any service provider
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              · You acknowledge that the nature of adventure travel requires flexibility and acknowledge that you will permit reasonable alterations to products, services or itineraries by the Tour Operator. The route, schedules, accommodations, activities, amenities and mode of transportation are subject to change without notice due to unforeseeable circumstances or events outside the control of the Tour Operator (including but not limited to Force Majeure, illness, mechanical breakdown, flight cancellations, strikes, political events and entry or border difficulties). No reimbursements, No compensation, No discounts or No refunds will be issued for services that are missed or unused after departure due to no fault of the Tour Operator, including your removal from a Tour because of your negligence or breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purchasing /Shopping</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              India Escapes and Service providers will not be responsible/liable at any place if any kind of purchase/shopping done by travellers during the tour they are solely responsible for their purchase/shopping.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal Information:</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              Kindly do not share your personal and any confidential information to guides and driver like emails, personal contact no. and social media channels as these people work with us as freelancers we do not want you to face any issues or any problem while travelling or after completion of your tour so India Escapes will be not be responsible nor liable for this.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of risk:</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              Traveller must aware that Tour they are taking such as that Traveller are undertaking involves hazardous activities, with a risk of illness, injury or death which may be caused by forces of nature, animals, insects or flora, the negligence of India Escapes, or other persons and companies known or unknown, or of willful or criminal conduct of third parties. Traveller aware that weather conditions may be severe, adverse and/or unpleasant. Traveller also aware that medical services or facilities may not be readily available or accessible during some or all of the time during which Traveller participating on the trip. In order to partake of the enjoyment and excitement of this trip Traveller willing to accept the risks and uncertainty involved as being an integral part of adventure. Traveller here by accept and assume full responsibility for any and all risks of illness, injury or death and of the negligence of India Escapes and Traveller agree to hold harmless and release India Escapes from claims of third party negligence.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              You agree to accept the authority and decisions of our employees, tour leaders, and agents whilst on tour with us. Our customers are expected to conduct themselves in an orderly and acceptable manner and not to disrupt the enjoyment of others. If in our opinion or in the opinion of any hotel manager or any other person in authority, your behaviour or that of any member of your party is causing or is likely to cause damage, distress, danger or annoyance to any other customers or any third party, we reserve the right to terminate your booking with us immediately. In the event of such termination our liability to you and/or your party will cease and you and/or your party will be required to leave your accommodation or other arrangements immediately. We will have no further obligations to you and/or your party.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              No refunds and compensation for lost accommodation or any other arrangements will be made, and we will not pay any expenses or costs incurred as a result of termination under these circumstances. You and/or your party may also be required to pay for loss and/or damage caused by your actions, and we will hold you and each member of your party jointly and individually liable for any damage or losses caused. Full payment for any such damage or losses must be paid directly to the hotel manager or other supplier prior to departure. If you fail to make payment, you will be responsible for meeting any claims (including legal costs) subsequently made against us as a result of your actions together with all costs we incur in pursuing any claim against you.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              We cannot be held responsible for the actions or behaviour of other guests or individuals who have no connection with your booking arrangements or with us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Photographic & Videos</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              India Escapes may take photographs or video of its trips and trip participants grant India Escapes permission to do so and for it to use same for promotional or commercial use without payment of any compensation to Traveller/Participants. Traveller can not claim compensation or any legal action to India Escapes for using such photographs & Videos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Release from liability</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              India Escapes, its shareholders, directors, officers, employees and affiliates, (collectively “India Escapes“) does not own or operate any entity which is to or does provide goods or services for your trip including, for example, ownership or control over hotels or other lodging facilities, airline, vessel, bus, van or other transportation companies, local ground operators, providers or organizers of optional excursions or equipment used thereon, food service or entertainment providers, etc. All such persons and entities are independent contractors. Independent contractors may utilize the India Escapes on signage or uniforms solely for identification purposes which does not signify India Escapes ownership, management or control. As a result, India Escapes is not liable and Responsible for any negligent or willful act or failure to act of any such person or entity, or of any other third party.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              Without limitation, India Escapes is not responsible and liable for any injury, loss, or Physical abuse, Sexual Abuse, Sexual Assault, Molestation damage to person or property, death, delay or inconvenience in connection with the provision of any goods or services occasioned by or resulting from, but not limited to, acts of God, acts of government, force majeure, acts of war or civil unrest, insurrection or revolt, strikes or other labor activities, criminal or terrorist activities of any kind, or the threat thereof, overbooking or downgrading of accommodations, structural or other defective conditions in hotels or other lodging facilities, mechanical or other failure of airplanes or other means of transportation or for any failure of any transportation mechanism to arrive or depart timely or safely, diseases and dangers associated with or bites from animals, pests or insects, marine life or vegetation of any sort, dangers incident to recreational activities such as swimming, kayaking, sailing, canoeing, rafting, hiking, walking, bicycling, etc., sanitation problems, food poisoning, lack of access to or quality of medical care, difficulty in evacuation in case of a medical or other emergency, illness, epidemics or the threat thereof or for any other cause beyond the direct control of India Escapes. In addition, Traveller /any family member/any minor/third parties is not liable to claim any compensation/refund or take any legal action against India Escapes. India Escapes will not be liable and Responsible for the mentioned above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emergency Contact Details</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              It is recommended that you provide emergency contact details prior to travel. The reason we collect this information is to be able to get in contact with family or friends in the rare case of an emergency.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Passport Visas</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              It is your responsibility to obtain information and to have in your possession all the required documentation and identification required for entry, departure and travel to each country or region you visit on your trip. This includes a valid passport and all travel documents required by us and/or the relevant governmental authorities including all visas, permits and certificates (including but not limited to vaccination or medical certificates) and insurance policies. You accept full responsibility for obtaining all such documents, visas and permits prior to the start of the trips, and you are solely responsible for the full amount of costs incurred as a result of missing or defective documentation. You agree that you are responsible for the full amount of any loss or expense incurred by us that is a direct result of your failure to secure or be in possession of proper travel documentation. India Escapes is not liable / Responsible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Occasional Alternative Accommodation</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              The style of accommodation indicated in the day-to-day itinerary is a guideline. On rare occasions, alternative arrangements may need to be made due to the lack of availability of rooms in our usual accommodation. A similar standard of accommodation will be used in these instances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Insurance</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              It is a recommendation of booking that you have or arrange adequate insurance cover for personal liability, medical (including repatriation) and holiday cancellation, to be valid from the date when the contract between us comes into existence until the holiday is completed. When obtaining travel insurance you must ensure that policy is adequate for the specific holiday and that the insurer is aware of the type and destination of travel and any activities which you plan to undertake that may be considered high risk such as skiing, scuba diving, white water rafting, travel by light aircraft, paragliding, kite surfing, wind surfing, safaris, or mountain trekking. Please ensure that you are fully covered, in particular with regard to the maximum cancellation amount. We may need to refer to this if you are involved in an accident. If you do not arrange the aforementioned cover, India Escapes may, if it chooses, refuse your booking or cancel your holiday. In any event, India Escapes will not be held responsible for any expenses, loss or damage you incur as a result of your failure to comply with this clause or the requirements of your travel insurance policy.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              Travel insurance is recommended for all our travellers and must be taken out at the time of booking. Your travel insurance must provide cover against personal accident, death, medical expenses and emergency repatriation with a recommended minimum coverage of US$200,000 for each of the categories of cover. We also strongly recommend it covers cancellation, curtailment, personal liability and loss of luggage and personal effects. You must provide your travel insurance policy number and the insurance company's 24-hour emergency contact number on the first day of your trip; we will not recommend to join the trip without these details. If you have travel insurance connected to your credit card or bank account please ensure you have details of the participating insurer, the insurance policy number and emergency contact number with you rather than the bank's name and credit card details
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              Furthermore, if you choose to travel with inadequate insurance cover, we will not be liable for any losses
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-4">
              India Escapes will not responsible and liable for compensation if we cancel your tour.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Responsible travel guidelines:</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              Everyone has the right to feel safe when they travel. We don't tolerate any form of violence (verbal or physical) or sexual harassment, either between customers or involving our leaders, partners, or local people. Sexual relationships between a tour leader and a customer are strictly forbidden. Use or possession of illegal drugs will not be tolerated on our trips. If you choose to consume alcohol while travelling, we encourage responsible drinking, and expect that you'll abide by the local laws regarding alcohol consumption. patronising sex workers will not be tolerated on our trips. Everyone has the right to feel safe and secure on their trip. We don't tolerate any form of sexual harassment, either between passengers or involving our leaders or local operators. Sexual relationships (consensual or otherwise) between a leader and a passenger are unacceptable. By travelling with us you are agreeing to adhere to these rules. Your group leader has the right to remove any member of the group for breaking any of these rules, with no right of refund. If you feel that someone is behaving inappropriately while travelling with us, please inform your tour leader or local guide immediately. Alternatively, you can reach our local India office on their 24-hour number: Emergency contacts:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">India Contact</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              Address: Verma Building, top floor, Bhatakuffer Chowk, Sanjauli, Shimla – H.P, 171006
            </p>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base mt-2">
              1. Name: Mr. Jitender Thakur Mobile: +91-8091066115 Name: Ajay Sharma Mobile: +91 9805670008
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jurisdiction Clause</h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              All the disputes arising out of this agreement or any other subsequent agreement would be subject to Shimla (India) Courts only.
            </p>
          </section>

        </div>
      </div>

    </>
  );
}