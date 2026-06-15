import os
from openai import OpenAI

class VoiceService:
    @staticmethod
    def transcribe_audio(audio_file_path):
        """
        Transcribe audio using OpenAI's Whisper model.
        If the API key is not available, return a message indicating Web Speech API fallback.
        """
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            return {
                "success": False,
                "message": "OpenAI API Key not configured. Using local frontend Web Speech API as fallback."
            }
            
        try:
            client = OpenAI(api_key=api_key)
            with open(audio_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                return {
                    "success": True,
                    "text": transcript.text
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Transcription error: {str(e)}"
            }
