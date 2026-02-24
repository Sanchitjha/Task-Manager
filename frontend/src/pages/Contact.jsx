import { Link } from 'react-router-dom';

export default function Contact() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 py-20 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="card-glass p-8 md:p-12">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Contact Us
					</h1>
					<p className="text-center text-gray-600 mb-8">
						We're here to help societies and residents manage operations better.
					</p>

					<div className="space-y-6 mb-8">
						<div className="flex items-start gap-4">
							<div className="text-3xl">📧</div>
							<div>
								<h3 className="font-bold text-gray-800 mb-1">Email</h3>
								<a href="mailto:support@themanager.in" className="text-brand-600 hover:text-brand-700">
									support@themanager.in
								</a>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="text-3xl">📱</div>
							<div>
								<h3 className="font-bold text-gray-800 mb-1">Phone</h3>
								<a href="tel:+919328961255" className="text-brand-600 hover:text-brand-700">
									+91-9328961255
								</a>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="text-3xl">🕒</div>
							<div>
								<h3 className="font-bold text-gray-800 mb-1">Business Hours</h3>
								<p className="text-gray-700">Monday to Saturday | 10:00 AM – 6:00 PM</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="text-3xl">📍</div>
							<div>
								<h3 className="font-bold text-gray-800 mb-1">Office Address</h3>
								<p className="text-gray-700">
									The Manager<br />
									[Office Address - To Be Updated]
								</p>
							</div>
						</div>
					</div>

					<div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
						<p className="text-gray-700">
							For service inquiries, partnerships, or support requests, please reach out through our official contact channels. Our team will respond at the earliest.
						</p>
					</div>

					{/* Legal Disclaimer */}
					<div className="border-t border-gray-200 pt-8 mt-8">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">Legal Disclaimer</h2>
						<div className="text-gray-700 leading-relaxed space-y-3">
							<p>
								The information provided by The Manager is for operational and informational purposes only.
							</p>
							<p>
								We do not provide legal, financial, or regulatory advice unless explicitly stated in writing.
							</p>
							<p>
								Society decisions remain the responsibility of the respective managing committee.
							</p>
							<p>
								The Manager operates as a professional support service and does not replace statutory authorities or governing bodies.
							</p>
							<p className="font-semibold">
								Use of our services implies acceptance of this disclaimer.
							</p>
						</div>
					</div>

					<div className="mt-8 text-center">
						<Link to="/" className="text-brand-600 hover:text-brand-700 font-semibold">
							← Back to Home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
