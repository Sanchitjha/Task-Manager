import { Link } from 'react-router-dom';
import TheManagerLogo from '../components/TheManagerLogo';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Home() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('about');
	
	const features = [
		{
			icon: '🏘️',
			title: 'Society Management',
			description: 'Streamline administrative coordination, process management, and compliance assistance',
			gradient: 'from-blue-400 to-cyan-500'
		},
		{
			icon: '👥',
			title: 'Community Coordination',
			description: 'Maintain discipline, coordination, and operational clarity in day-to-day activities',
			gradient: 'from-green-400 to-emerald-500'
		},
		{
			icon: '⚡',
			title: 'Member Services',
			description: 'Convenience-driven services and verified solutions that save time and reduce effort',
			gradient: 'from-purple-400 to-pink-500'
		}
	];

	const tabs = [
		{ id: 'about', label: 'About Us', icon: '📖' },
		{ id: 'privacy', label: 'Privacy', icon: '🔒' },
		{ id: 'terms', label: 'Terms', icon: '📜' },
		{ id: 'security', label: 'Security', icon: '🛡️' },
		{ id: 'contact', label: 'Contact', icon: '📞' }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 animate-fade-in">
			{/* Logo and Title Section */}
			<div className="flex flex-col items-center justify-center pt-20 pb-8 px-4">
				<div className="animate-slide-up">
					<TheManagerLogo width={140} height={140} className="drop-shadow-2xl" />
				</div>
				<h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-8 mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: '0.1s' }}>
					The MANAGER
				</h1>
				<p className="text-xl md:text-2xl text-gray-600 max-w-3xl mt-2 mb-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
					Structured Social Management Service for Housing Societies
				</p>
			</div>

			{/* Main CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
				<Link to="/login" className="btn-primary text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
					<span className="flex items-center gap-2">
						<span>Sign In</span>
						<span>→</span>
					</span>
				</Link>
				<Link to="/register" className="btn-secondary text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
					<span className="flex items-center gap-2">
						<span>Create Account</span>
						<span>✨</span>
					</span>
				</Link>
			</div>

			{/* Tabbed Content Section */}
			<section className="max-w-6xl mx-auto px-4 py-12 mb-12 w-full">
				{/* Tab Navigation */}
				<div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
								activeTab === tab.id
									? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
									: 'bg-white text-gray-700 hover:bg-gray-50 shadow'
							}`}
						>
							<span className="flex items-center gap-2">
								<span className="text-xl">{tab.icon}</span>
								<span>{tab.label}</span>
							</span>
						</button>
					))}
				</div>

				{/* Tab Content */}
				<div className="card-glass p-8 md:p-12 animate-fade-in">
					{/* About Us Tab */}
					{activeTab === 'about' && (
						<div className="animate-slide-up">
							<h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								About Us
							</h2>
							
							<div className="mb-8 text-left space-y-4">
								<p className="text-gray-700 leading-relaxed text-lg">
									The Manager is a structured social management service designed to support housing societies and community-based organizations in running their operations efficiently and transparently. We work as an extended management arm of the society, helping committees and residents maintain discipline, coordination, and operational clarity in day-to-day activities.
								</p>
								<p className="text-gray-700 leading-relaxed text-lg">
									Our role focuses on simplifying society operations such as administrative coordination, process management, compliance assistance, and communication flow. By introducing organized systems and standardized processes, The Manager helps societies function smoothly, reduce internal friction, and ensure accountability at every level.
								</p>
								<p className="text-gray-700 leading-relaxed text-lg">
									Beyond operational support, The Manager also delivers personal value to individual society members. We provide members with access to convenience-driven services, structured support, and verified solutions that save time, reduce effort, and improve overall living experience.
								</p>
								<p className="text-gray-700 leading-relaxed text-lg font-semibold">
									At its core, The Manager aims to create well-managed, reliable, and future-ready communities—where society operations are professionally handled and members enjoy a smarter, more convenient lifestyle.
								</p>
							</div>

							<div className="border-t border-gray-200 my-8"></div>

							{/* Hindi */}
							<div className="mb-8 text-left space-y-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
								<p className="text-gray-700 leading-relaxed text-lg">
									The Manager एक संरचित सामाजिक प्रबंधन सेवा है जो हाउसिंग सोसाइटी के संचालन को सुचारु, पारदर्शी और प्रभावी बनाती है। हम प्रशासन, समन्वय और प्रक्रिया प्रबंधन के माध्यम से सोसाइटी को व्यवस्थित रूप से चलाने में सहायता करते हैं।
								</p>
								<p className="text-gray-700 leading-relaxed text-lg">
									इसके साथ ही, The Manager सोसाइटी के सदस्यों को व्यक्तिगत लाभ प्रदान करता है—ऐसी सुविधाजनक और विश्वसनीय सेवाएँ जो समय बचाएँ, प्रयास कम करें और जीवन को अधिक सरल बनाएं। हमारा उद्देश्य संगठित, भरोसेमंद और आधुनिक समुदायों का निर्माण करना है।
								</p>
							</div>

							<div className="border-t border-gray-200 my-8"></div>

							{/* Gujarati */}
							<div className="text-left space-y-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
								<p className="text-gray-700 leading-relaxed text-lg">
									The Manager એક સંરચિત સામાજિક મેનેજમેન્ટ સેવા છે, જે હાઉસિંગ સોસાયટીના સંચાલનને સુવ્યવસ્થિત, પારદર્શક અને અસરકારક બનાવે છે. અમે પ્રશાસન, સમન્વય અને પ્રક્રિયા મેનેજમેન્ટ દ્વારા સોસાયટીને સુચારૂ રીતે ચલાવવામાં મદદ કરીએ છીએ.
								</p>
								<p className="text-gray-700 leading-relaxed text-lg">
									આ સાથે, The Manager સોસાયટીના સભ્યોને વ્યક્તિગત લાભ પણ આપે છે—સમય બચાવે તેવી, વિશ્વસનીય અને સુવિધાજનક સેવાઓ દ્વારા જીવનને વધુ સરળ અને સુવ્યવસ્થિત બનાવે છે. અમારો હેતુ સંગઠિત, વિશ્વસનીય અને આધુનિક સમુદાયો બનાવવાનો છે.
								</p>
							</div>
						</div>
					)}

					{/* Privacy Policy Tab */}
					{activeTab === 'privacy' && (
						<div className="animate-slide-up">
							<h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								Privacy Policy
							</h2>
							<div className="text-gray-700 leading-relaxed space-y-6">
								<p className="text-lg">
									At The Manager, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard data provided by residents, society committees, vendors, and visitors to our platform.
								</p>

								<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">📋 Information We Collect</h3>
									<p>
										We may collect basic personal and operational information such as name, contact details, flat number, society details, service requests, and communication records. This information is collected only to deliver our services effectively and improve user experience.
									</p>
								</div>

								<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">🎯 Use of Information</h3>
									<p className="mb-3">Collected data is used strictly for:</p>
									<ul className="list-disc list-inside space-y-2 ml-4">
										<li>Society operations management</li>
										<li>Service coordination and communication</li>
										<li>Complaint tracking and resolution</li>
										<li>Improving platform functionality</li>
										<li>Compliance and internal reporting</li>
									</ul>
									<p className="mt-3 font-semibold">
										We do not sell or rent personal data to third parties.
									</p>
								</div>

								<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">🔒 Data Protection</h3>
									<p>
										We implement reasonable administrative, technical, and organizational measures to protect your information from unauthorized access, misuse, or disclosure. Access to data is limited to authorized personnel only.
									</p>
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-blue-50 p-4 rounded-lg">
										<h4 className="font-bold text-gray-800 mb-2">Data Sharing</h4>
										<p className="text-sm">Information may be shared with verified service partners strictly for service fulfillment.</p>
									</div>
									<div className="bg-purple-50 p-4 rounded-lg">
										<h4 className="font-bold text-gray-800 mb-2">User Rights</h4>
										<p className="text-sm">Request access, correction, or deletion of your personal information anytime.</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Terms & Conditions Tab */}
					{activeTab === 'terms' && (
						<div className="animate-slide-up">
							<h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								Terms & Conditions
							</h2>
							<div className="text-gray-700 leading-relaxed space-y-6">
								<p className="text-lg">
									By accessing or using The Manager services, users agree to comply with the following Terms & Conditions. These terms govern the use of our services by housing societies, committee members, residents, vendors, and partners.
								</p>

								<div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-500">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">🏢 Service Scope</h3>
									<p>
										The Manager provides operational coordination, process management, and structured support services for housing societies. We act as a management support partner and do not directly execute physical services unless explicitly stated.
									</p>
								</div>

								<div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-l-4 border-green-500">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">👤 User Responsibilities</h3>
									<p>
										Users agree to provide accurate information and cooperate during service coordination. Misuse of services, false complaints, or unauthorized activities may result in service suspension.
									</p>
								</div>

								<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">🤝 Vendor & Third-Party Services</h3>
									<p>
										Services delivered through vendors or partners are subject to their availability and performance. The Manager facilitates coordination but is not liable for independent vendor actions beyond agreed scopes.
									</p>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									<div className="bg-yellow-50 p-4 rounded-lg text-center">
										<div className="text-3xl mb-2">💰</div>
										<h4 className="font-bold text-gray-800 mb-2">Payments & Fees</h4>
										<p className="text-sm">Service fees are defined through formal agreements</p>
									</div>
									<div className="bg-red-50 p-4 rounded-lg text-center">
										<div className="text-3xl mb-2">⚠️</div>
										<h4 className="font-bold text-gray-800 mb-2">Liability Limits</h4>
										<p className="text-sm">Not liable for circumstances beyond control</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg text-center">
										<div className="text-3xl mb-2">🚫</div>
										<h4 className="font-bold text-gray-800 mb-2">Termination</h4>
										<p className="text-sm">Services may be suspended for violations</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Security Policy Tab */}
					{activeTab === 'security' && (
						<div className="animate-slide-up">
							<h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								Security Policy
							</h2>
							<div className="text-gray-700 leading-relaxed space-y-6">
								<p className="text-lg text-center">
									At The Manager, data security is a priority. We adopt structured measures to protect information related to societies, residents, and operations.
								</p>

								<div className="grid md:grid-cols-2 gap-6">
									<div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
										<div className="text-4xl mb-4">🔐</div>
										<h3 className="text-2xl font-bold mb-3">Security Measures</h3>
										<ul className="space-y-2">
											<li>✓ Controlled access to systems</li>
											<li>✓ Role-based authorization</li>
											<li>✓ Secure data storage</li>
											<li>✓ Regular internal reviews</li>
										</ul>
									</div>

									<div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
										<div className="text-4xl mb-4">👥</div>
										<h3 className="text-2xl font-bold mb-3">Data Access</h3>
										<p>
											Only authorized personnel can access sensitive information, strictly for operational purposes.
										</p>
									</div>
								</div>

								<div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white shadow-lg">
									<div className="flex items-center gap-4">
										<div className="text-5xl">🛡️</div>
										<div>
											<h3 className="text-2xl font-bold mb-2">Incident Handling</h3>
											<p>
												Any suspected security incident is investigated promptly, and corrective action is taken to minimize impact.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
									<p className="text-gray-700 flex items-center gap-3">
										<span className="text-3xl">⚡</span>
										<span>While we follow best practices, no system can guarantee absolute security. Users are encouraged to follow safe usage practices.</span>
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Contact Tab */}
					{activeTab === 'contact' && (
						<div className="animate-slide-up">
							<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								Contact Us
							</h2>
							<p className="text-center text-gray-600 mb-8 text-lg">
								We're here to help societies and residents manage operations better.
							</p>

							<div className="grid md:grid-cols-2 gap-6 mb-8">
								<div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
									<div className="text-5xl mb-4">📧</div>
									<h3 className="font-bold text-xl mb-2">Email Us</h3>
									<a href="mailto:support@themanager.in" className="text-white hover:text-gray-200 text-lg underline">
										support@themanager.in
									</a>
								</div>

								<div className="bg-gradient-to-br from-green-500 to-teal-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
									<div className="text-5xl mb-4">📱</div>
									<h3 className="font-bold text-xl mb-2">Call Us</h3>
									<a href="tel:+919328961255" className="text-white hover:text-gray-200 text-lg underline">
										+91-9328961255
									</a>
								</div>

								<div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
									<div className="text-5xl mb-4">🕒</div>
									<h3 className="font-bold text-xl mb-2">Business Hours</h3>
									<p className="text-lg">Monday to Saturday</p>
									<p className="text-lg">10:00 AM – 6:00 PM</p>
								</div>

								<div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
									<div className="text-5xl mb-4">📍</div>
									<h3 className="font-bold text-xl mb-2">Office Address</h3>
									<p className="text-lg">The Manager</p>
									<p className="text-sm opacity-90">[Address To Be Updated]</p>
								</div>
							</div>

							<div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded">
								<p className="text-gray-700 flex items-center gap-3">
									<span className="text-2xl">💡</span>
									<span>For service inquiries, partnerships, or support requests, please reach out through our official contact channels. Our team will respond at the earliest.</span>
								</p>
							</div>

							{/* Legal Disclaimer */}
							<div className="border-t border-gray-200 pt-8 mt-8">
								<h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">⚖️ Legal Disclaimer</h3>
								<div className="text-gray-700 leading-relaxed space-y-3 bg-gray-50 p-6 rounded-xl">
									<p>• The information provided by The Manager is for operational and informational purposes only.</p>
									<p>• We do not provide legal, financial, or regulatory advice unless explicitly stated in writing.</p>
									<p>• Society decisions remain the responsibility of the respective managing committee.</p>
									<p>• The Manager operates as a professional support service and does not replace statutory authorities or governing bodies.</p>
									<p className="font-semibold text-center mt-4">Use of our services implies acceptance of this disclaimer.</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* Features Section */}
			<section className="max-w-6xl mx-auto px-4 py-20">
				<div className="text-center mb-12 animate-slide-up">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						Powerful Features
					</h2>
					<p className="text-lg text-gray-600">Everything you need in one platform</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div 
							key={index}
							className="card-gradient hover-lift group cursor-pointer"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							<div className={`text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block group-hover:animate-bounce`}>
								{feature.icon}
							</div>
							<h3 className="text-2xl font-bold mb-3 text-gray-800">
								{feature.title}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{feature.description}
							</p>
							<div className={`mt-4 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
						</div>
					))}
				</div>
			</section>

			{/* How It Works Section */}
			<section className="max-w-6xl mx-auto px-4 py-20">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						How It Works
					</h2>
					<p className="text-lg text-gray-600">Get started in 3 simple steps</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{[
						{ step: '1', title: 'Register', description: 'Create your account as a society member or admin', icon: '✍️' },
						{ step: '2', title: 'Connect', description: 'Link with your housing society and access services', icon: '🏘️' },
						{ step: '3', title: 'Enjoy', description: 'Experience organized management and convenient lifestyle', icon: '✨' }
					].map((item, index) => (
						<div key={index} className="relative">
							<div className="card-glass text-center hover-lift">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-2xl font-bold mb-4 shadow-glow">
									{item.step}
								</div>
								<div className="text-4xl mb-3">{item.icon}</div>
								<h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
								<p className="text-gray-600">{item.description}</p>
							</div>
							{index < 2 && (
								<div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-brand-300 text-4xl">
									→
								</div>
							)}
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto px-4 py-20">
				<div className="card-gradient text-center p-12 relative overflow-hidden">
					{/* Background decoration */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200 to-accent-200 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent-200 to-brand-200 rounded-full blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
					
					<div className="relative z-10">
						<h2 className="text-4xl md:text-5xl font-bold mb-6">
							<span className="text-gradient-hero">Ready to Transform Your Society?</span>
						</h2>
						<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
							Join well-managed, reliable, and future-ready communities where operations are professionally handled
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/register" className="btn-primary text-lg px-8 py-4">
								Get Started Free 🚀
							</Link>
							<Link to="/login" className="btn-secondary text-lg px-8 py-4">
								Sign In
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-20">
				<div className="max-w-6xl mx-auto px-4 py-12">
					<div className="grid md:grid-cols-4 gap-8 mb-8">
						<div>
							<h3 className="font-bold text-xl text-gradient mb-4">The MANAGER</h3>
							<p className="text-gray-600 text-sm">Your structured social management service</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li><Link to="/login" className="hover:text-brand-600 transition">Sign In</Link></li>
								<li><Link to="/register" className="hover:text-brand-600 transition">Register</Link></li>
								<li><Link to="/contact" className="hover:text-brand-600 transition">Contact Us</Link></li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-800 mb-3">Policies</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li><Link to="/privacy" className="hover:text-brand-600 transition">Privacy Policy</Link></li>
								<li><Link to="/terms" className="hover:text-brand-600 transition">Terms & Conditions</Link></li>
								<li><Link to="/security" className="hover:text-brand-600 transition">Security Policy</Link></li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li>Email: support@themanager.in</li>
								<li>Phone: +91-9328961255</li>
								<li>Mon-Sat: 10 AM - 6 PM</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-200 pt-8 text-center">
						<p className="text-sm text-gray-600">
							© {new Date().getFullYear()} The MANAGER. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
