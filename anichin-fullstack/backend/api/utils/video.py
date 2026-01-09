from .parsing import Parsing
from urllib.parse import urlparse, urlencode, parse_qsl
from dotenv import load_dotenv
import os
from base64 import b64decode
import logging
from typing import Dict, List, Optional, Any, Union
from bs4 import BeautifulSoup

load_dotenv()
logger = logging.getLogger(__name__)

class Video(Parsing):
    def __init__(self, slug: str) -> None:
        super().__init__()
        self.slug: str = slug

    def get_details(self) -> Dict[str, Any]:
        """Get video details including all server mirrors."""
        try:
            data = self.get_parsed_html(self.slug)
            if not data:
                return {"medias": [], "error": "Page not found"}

            # 1. Try to find the Mirror Select element
            video_select = data.find("select", {"class": "mirror"})
            if not video_select:
                return {"medias": [], "error": "No video servers found"}

            # 2. Scrape ALL options, not just OK.ru
            medias = []
            options = video_select.find_all("option")
            
            for option in options:
                try:
                    server_name = option.text.strip()
                    encoded_value = option.get("value")
                    
                    if not encoded_value:
                        continue

                    # Decode the base64 value to get the HTML containing the iframe
                    decoded_html = b64decode(encoded_value).decode("utf-8")
                    parsed_iframe = self.parsing(decoded_html)
                    iframe = parsed_iframe.find("iframe")
                    
                    if iframe and iframe.get("src"):
                        video_url = iframe["src"]
                        
                        # Fix formatting for certain sources if needed
                        if "videoembed" in video_url:
                            video_url = video_url.replace("videoembed", "video")
                            
                        medias.append({
                            "quality": server_name, # Use server name as "quality" label
                            "url": video_url,
                            "extension": "iframe"
                        })
                except Exception as e:
                    logger.error(f"Failed to parse server {option.text}: {e}")
                    continue

            # 3. Handle case where no mirrors are found
            if not medias:
                return {"medias": [], "error": "No valid video links found"}

            return {"medias": medias}

        except Exception as e:
            logger.error(f"Error in get_details: {e}")
            return {"medias": [], "error": str(e)}

if __name__ == "__main__":
    # Test
    video = Video("throne-of-seal-episode-98-subtitle-indonesia") 
    print(video.get_details())