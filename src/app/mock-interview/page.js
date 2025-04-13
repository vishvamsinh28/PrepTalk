import MockInterview from "../components/MockInterview";

export default function MockInterviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 mt-15">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-300 mb-6 text-center">AI Mock Interview 🎙️</h1>
        <p className="text-gray-400 mb-8 text-center">
          Prep yourself with a fully AI-powered interview simulation! 🚀
        </p>
        <center>
        <MockInterview />
        </center>
      </div>
    </div>
  );
}
