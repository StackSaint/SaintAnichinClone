from bs4 import BeautifulSoup
from dotenv import load_dotenv
from os import getenv
from requests import Response
import logging
from typing import Optional, Dict, Any
import cloudscraper # REQUIRED: pip install cloudscraper

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)


class Parsing:
    def __init__(self) -> None:
        # We use composition instead of inheritance here to wrap the cloudscraper session
        self.scraper = cloudscraper.create_scraper()
        self.url: str = "https://anichin.club"
        self.history_url: Optional[str] = None
        logger.info(f"Initialized Parsing session with URL: {self.url}")

    def __get_html(self, slug: str, **kwargs: Any) -> Optional[str]:
        """Get HTML content from the specified slug."""
        try:
            if slug.startswith("/"):
                url = f"{self.url}{slug}"
            else:
                url = f"{self.url}/{slug}"

            # Cloudscraper handles the cookies automatically, so we removed the hardcoded string.
            headers: Dict[str, str] = {
                "User-Agent": getenv(
                    "USER_AGENT",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
                ),
            }

            if kwargs.get("headers"):
                headers.update(kwargs["headers"])
            kwargs["headers"] = headers

            logger.debug(f"Making request to: {url}")
            
            # Use self.scraper.get instead of self.get
            response: Response = self.scraper.get(url, **kwargs)
            response.raise_for_status()  # Raise an exception for bad status codes

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