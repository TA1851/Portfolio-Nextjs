import { FC } from 'react';

const PlanPage: FC = () => {
  return (
    <>
      <div className="bg-white py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-8 lg:text-3xl xl:mb-12">Our plans for you</h2>

          <div className="mb-6 grid gap-6 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 lg:gap-8">
            <div className="flex flex-col rounded-lg border p-4 pt-6">
              <div className="mb-12">
                <div className="mb-2 text-center text-2xl font-bold text-gray-800">Free</div>

                <p className="mx-auto mb-8 px-8 text-center text-gray-500">For individuals and organizations who want to try our system</p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">1.000 MB file storage</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">2.000 MB bandwidth per month</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">200 tasks per month</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Comunity support</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="self-start text-gray-600">$</span>
                  <span className="text-4xl font-bold text-gray-800">0</span>
                  <span className="text-gray-500">per user/month</span>
                </div>

                <a href="#" className="block rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base">Join for free</a>
              </div>
            </div>
            <div className="relative flex flex-col rounded-lg border-2 border-indigo-500 p-4 pt-6">
              <div className="mb-12">
                <div className="absolute inset-x-0 -top-3 flex justify-center">
                  <span className="flex h-6 items-center justify-center rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">most popular</span>
                </div>

                <div className="mb-2 text-center text-2xl font-bold text-gray-800">Team</div>

                <p className="mx-auto mb-8 px-8 text-center text-gray-500">Avanced feaures for Individuals and organizations</p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Unlimited file storage</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">10 GB bandwidth per month</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">10.000 tasks per month</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Email support</span>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">100 Webhooks</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="self-start text-gray-600">$</span>
                  <span className="text-4xl font-bold text-gray-800">19</span>
                  <span className="text-gray-500">per user/month</span>
                </div>

                <a href="#" className="block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base">Continue with Team</a>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border p-4 pt-6">
              <div className="mb-12">
                <div className="mb-2 text-center text-2xl font-bold text-gray-800">Enterprise</div>

                <p className="mx-auto mb-8 px-8 text-center text-gray-500">Maximum performace for organisations</p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Unlimited file storage</span>
                  </div>

                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Unlimited bandwidth per month</span>
                  </div>

                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">1.000.000 tasks per month</span>
                  </div>

                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Email and phone support</span>
                  </div>

                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <span className="text-gray-600">Unlimited Webhooks</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="self-start text-gray-600">$</span>
                  <span className="text-4xl font-bold text-gray-800">49</span>
                  <span className="text-gray-500">per user/month</span>
                </div>

                <a href="#" className="block rounded-lg bg-gray-800 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-gray-700 focus-visible:ring active:bg-gray-600 md:text-base">Contact Sales</a>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 sm:text-base">Need help deciding? <a href="#" className="text-gray-500 underline transition duration-100 hover:text-indigo-500 active:text-indigo-600">Get in touch</a>.</div>
        </div>
      </div>
    </>
  )
};
export default PlanPage;