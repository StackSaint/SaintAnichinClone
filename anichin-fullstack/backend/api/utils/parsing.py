from bs4 import BeautifulSoup
from dotenv import load_dotenv
from requests import Session, Response
import logging
import cloudscraper # Import the new library
from typing import Optional, Dict, Any

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class Parsing(Session):
    def __init__(self) -> None:
        super().__init__()
        self.url: str = "https://anichin.club"
        self.history_url: Optional[str] = None
        
        # Initialize the Cloudscraper session
        # This acts like a browser (Chrome) to bypass Cloudflare
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True
            }
        )
        logger.info(f"Initialized Cloudscraper session with URL: {self.url}")

    def __get_html(self, slug: str, **kwargs: Any) -> Optional[str]:
        """Get HTML content using Cloudscraper."""
        try:
            if slug.startswith("/"):
                url = f"{self.url}{slug}"
            else:
                url = f"{self.url}/{slug}"

            # We don't need to manually set User-Agent or Cookies anymore.
            # Cloudscraper handles that for us.

            logger.debug(f"Making request to: {url}")
            
            # Use self.scraper.get instead of self.get
            response: Response = self.scraper.get(url, **kwargs)
            response.raise_for_status()

            self.history_url = url
            logger.debug(f"Successfully fetched content from: {url}")
            return response.text

        except Exception as e:
            logger.error(f"Failed to fetch HTML from {slug}: {e}")
            return None

    def get_parsed_html(self, url: str, **kwargs: Any) -> Optional[BeautifulSoup]:
        """Get parsed HTML content using BeautifulSoup."""
        try:
            html_content = self.__get_html(url, **kwargs)
            if html_content:
                parsed = BeautifulSoup(html_content, "html.parser")
                logger.debug(f"Successfully parsed HTML content for: {url}")
                return parsed
            else:
                logger.warning(f"No HTML content to parse for: {url}")
                return None
        except Exception as e:
            logger.error(f"Failed to parse HTML for {url}: {e}")
            return None

    def parsing(self, data: str) -> Optional[BeautifulSoup]:
        """Parse HTML data using BeautifulSoup."""
        try:
            if not data:
                logger.warning("Empty data provided for parsing")
                return None

            parsed = BeautifulSoup(data, "html.parser")
            logger.debug("Successfully parsed provided HTML data")
            return parsed
        except Exception as e:
            logger.error(f"Failed to parse provided data: {e}")
            return None