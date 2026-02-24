import { Link } from 'react-router-dom';
import TheManagerLogo from '../components/TheManagerLogo';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
	const { user } = useAuth();
	
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

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 animate-fade-in">
			{/* Logo and Title Section */}
			<div className="flex flex-col items-center justify-center mt-12 mb-8">
				<TheManagerLogo width={120} height={120} />
				<h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6 mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					The MANAGER
				</h1>
				<p className="text-lg md:text-xl text-gray-600 max-w-3xl mt-2 mb-6 text-center">
					Structured Social Management Service for Housing Societies
				</p>
			</div>

			{/* Main CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
				<Link to="/login" className="btn-primary text-lg px-8 py-4">
					Sign In
				</Link>
				<Link to="/register" className="btn-secondary text-lg px-8 py-4">
					Create Account
				</Link>
			</div>

			{/* About Us Section */}
			<section className="max-w-5xl mx-auto px-4 py-12 mb-12">
				<div className="card-glass p-8 md:p-12">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						About Us
					</h2>
					
					{/* English */}
					<div className="mb-8 text-left">
						<p className="text-gray-700 leading-relaxed mb-4">
							The Manager is a structured social management service designed to support housing societies and community-based organizations in running their operations efficiently and transparently. We work as an extended management arm of the society, helping committees and residents maintain discipline, coordination, and operational clarity in day-to-day activities.
						</p>
						<p className="text-gray-700 leading-relaxed mb-4">
							Our role focuses on simplifying society operations such as administrative coordination, process management, compliance assistance, and communication flow. By introducing organized systems and standardized processes, The Manager helps societies function smoothly, reduce internal friction, and ensure accountability at every level.
						</p>
						<p className="text-gray-700 leading-relaxed mb-4">
							Beyond operational support, The Manager also delivers personal value to individual society members. We provide members with access to convenience-driven services, structured support, and verified solutions that save time, reduce effort, and improve overall living experience. Our approach ensures that while the society benefits from organized management, each member gains tangible personal advantages.
						</p>
						<p className="text-gray-700 leading-relaxed">
							At its core, The Manager aims to create well-managed, reliable, and future-ready communities—where society operations are professionally handled and members enjoy a smarter, more convenient lifestyle.
						</p>
					</div>

					<div className="border-t border-gray-200 my-8"></div>

					{/* Hindi */}
					<div className="mb-8 text-left">
						<p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
							The Manager एक संरचित सामाजिक प्रबंधन सेवा है जो हाउसिंग सोसाइटी के संचालन को सुचारु, पारदर्शी और प्रभावी बनाती है। हम प्रशासन, समन्वय और प्रक्रिया प्रबंधन के माध्यम से सोसाइटी को व्यवस्थित रूप से चलाने में सहायता करते हैं।
						</p>
						<p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
							इसके साथ ही, The Manager सोसाइटी के सदस्यों को व्यक्तिगत लाभ प्रदान करता है—ऐसी सुविधाजनक और विश्वसनीय सेवाएँ जो समय बचाएँ, प्रयास कम करें और जीवन को अधिक सरल बनाएं। हमारा उद्देश्य संगठित, भरोसेमंद और आधुनिक समुदायों का निर्माण करना है।
						</p>
					</div>

					<div className="border-t border-gray-200 my-8"></div>

					{/* Gujarati */}
					<div className="text-left">
						<p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
							The Manager એક સંરચિત સામાજિક મેનેજમેન્ટ સેવા છે, જે હાઉસિંગ સોસાયટીના સંચાલનને સુવ્યવસ્થિત, પારદર્શક અને અસરકારક બનાવે છે. અમે પ્રશાસન, સમન્વય અને પ્રક્રિયા મેનેજમેન્ટ દ્વારા સોસાયટીને સુચારૂ રીતે ચલાવવામાં મદદ કરીએ છીએ.
						</p>
						<p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
							આ સાથે, The Manager સોસાયટીના સભ્યોને વ્યક્તિગત લાભ પણ આપે છે—સમય બચાવે તેવી, વિશ્વસનીય અને સુવિધાજનક સેવાઓ દ્વારા જીવનને વધુ સરળ અને સુવ્યવસ્થિત બનાવે છે. અમારો હેતુ સંગઠિત, વિશ્વસનીય અને આધુનિક સમુદાયો બનાવવાનો છે.
						</p>
					</div>
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
		</div>
	);
}
