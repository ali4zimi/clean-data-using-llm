class TemplateService:
    @staticmethod
    def get_prompt_templates():
        """Return available prompt templates"""
        templates = [
            {
                "id": 1,
                "name": "German Word Extraction",
                "prompt": "You are a language learning assistant. Please extract all german words and respective meanings " +
                        "from the following text, find the meaning in english and also if it is nown find their gender. " +
                        "Also, classify the words into categories. For example, categorize the words into categories like food, travel, etc. " +
                        "If the word does not have example sentence, make one up. \n\n" +
                        "Format your response as the following structure: \n" +
                        "de_word, de_example, de_gender, de_category, en_word, en_example"
            },
            {
                "id": 2,
                "name": "Dutch Word Extraction",
                "prompt": "You are a language learning assistant. Please extract all dutch words and respective meanings " +
                        "from the following text, find the meaning in english and also if it is nown find their gender. " +
                        "Also, classify the words into categories. For example, categorize the words into categories like food, travel, etc. " +
                        "If the word does not have example sentence, make one up. \n\n" +
                        "Format your response as the following structure: \n" +
                        "nl_word, nl_example, nl_category, en_word, en_example"
            },
            {
                "id": 3,
                "name": "Extract customer data",
                "prompt": "You are a data extraction assistant. Please extract customer data from the following text. " +
                        "Extract the following fields: name, email, phone number, address."
            },
            {
                "id": 4,
                "name": "Extract product data",
                "prompt": "You are a data extraction assistant. Please extract product data from the following text. " +
                        "Extract the following fields: product name, price, description, category."
            },
            {
                "id": 5,
                "name": "Extract financial data",
                "prompt": "You are a financial data extraction assistant. Please extract financial data from the following text. " +
                        "Extract the following fields: transaction date, amount, description, category."
            }
        ]
        return templates
