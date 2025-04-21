class AOIManager:
    def __init__(self):
        self.pages = {}
        self.current_page = None
        self.debug = False
    
    def create_page(self, page_name):
        if page_name not in self.pages:
            self.pages[page_name] = []
        return page_name
    
    def set_current_page(self, page_name):
        if page_name not in self.pages:
            raise ValueError(f"La pagina '{page_name}' non esiste")
        self.current_page = page_name
        if self.debug:
            print(f"Pagina corrente impostata a: {page_name}")
        return self.current_page
    
    def define_aoi(self, name, x_min, y_min, width, height, page_name=None):
        if page_name is None:
            page_name = self.current_page
        if page_name is None:
            raise ValueError("Nessuna pagina specificata o impostata come corrente")
        if page_name not in self.pages:
            self.create_page(page_name)
        
        aoi = {
            'name': name,
            'x_min': x_min,
            'y_min': y_min,
            'x_max': x_min + width,
            'y_max': y_min + height,
            'width': width,
            'height': height
        }
        self.pages[page_name].append(aoi)
        return {
            'page': page_name,
            'index': len(self.pages[page_name]) - 1
        }
    
    def is_point_in_aoi(self, x, y, aoi_info, page_name=None):
        if isinstance(aoi_info, dict) and 'page' in aoi_info:
            page_name = aoi_info['page']
            aoi_idx = aoi_info['index']
        else:
            if page_name is None:
                page_name = self.current_page
            aoi_idx = aoi_info
        
        if page_name is None:
            raise ValueError("Nessuna pagina specificata o impostata come corrente")
        if page_name not in self.pages:
            raise ValueError(f"La pagina '{page_name}' non esiste")
        if aoi_idx >= len(self.pages[page_name]):
            raise ValueError(f"L'indice AOI {aoi_idx} non esiste nella pagina {page_name}")
        
        aoi = self.pages[page_name][aoi_idx]
        return (aoi['x_min'] <= x <= aoi['x_max']) and (aoi['y_min'] <= y <= aoi['y_max'])
    
    def get_aoi(self, aoi_info, page_name=None):
        if isinstance(aoi_info, dict) and 'page' in aoi_info:
            page_name = aoi_info['page']
            aoi_idx = aoi_info['index']
        else:
            if page_name is None:
                page_name = self.current_page
            aoi_idx = aoi_info
        if page_name is None:
            raise ValueError("Nessuna pagina specificata o impostata come corrente")
        if page_name not in self.pages:
            raise ValueError(f"La pagina '{page_name}' non esiste")
        if aoi_idx >= len(self.pages[page_name]):
            raise ValueError(f"L'indice AOI {aoi_idx} non esiste nella pagina {page_name}")
        return self.pages[page_name][aoi_idx]
    
    def get_all_aois(self, page_name=None):
        if page_name is None:
            page_name = self.current_page
        if page_name is None:
            raise ValueError("Nessuna pagina specificata o impostata come corrente")
        if page_name not in self.pages:
            raise ValueError(f"La pagina '{page_name}' non esiste")
        return self.pages[page_name]
    
    def get_all_pages(self):
        return list(self.pages.keys())
    
    def visualize_aois(self, page_name=None, figure=None, ax=None):
        if page_name is None:
            page_name = self.current_page
        if page_name is None:
            raise ValueError("Nessuna pagina specificata o impostata come corrente")
        if page_name not in self.pages:
            raise ValueError(f"La pagina '{page_name}' non esiste")
        
        try:
            import matplotlib.pyplot as plt
            from matplotlib.patches import Rectangle
        except ImportError:
            raise ImportError("Per visualizzare le AOI è necessario installare matplotlib: pip install matplotlib")
        
        if figure is None or ax is None:
            figure, ax = plt.subplots(figsize=(10, 8))
        
        ax.set_title(f"Scanpath Eye Tracking - {page_name.capitalize()}")
        ax.set_xlabel("Posizione X (pixel)")
        ax.set_ylabel("Posizione Y (pixel)")
        
        for i, aoi in enumerate(self.pages[page_name]):
            rect = Rectangle((aoi['x_min'], aoi['y_min']), 
                             aoi['width'], aoi['height'], 
                             linewidth=1, edgecolor='g', 
                             facecolor='none', linestyle='--')
            ax.add_patch(rect)
            ax.text(aoi['x_min'] + 5, aoi['y_min'] + 15, aoi['name'], 
                    bbox=dict(facecolor='lightgreen', alpha=0.7, edgecolor='none'),
                    fontsize=8)
        
        max_x = max([aoi['x_max'] for aoi in self.pages[page_name]]) + 100 if self.pages[page_name] else 800
        max_y = max([aoi['y_max'] for aoi in self.pages[page_name]]) + 100 if self.pages[page_name] else 600
        ax.set_xlim(0, max_x)
        ax.set_ylim(0, max_y)
        
        return figure, ax
    
    def enable_debug(self, enabled=True):
        self.debug = enabled


def setup_aois_for_ecommerce(aoi_manager):
    page_aois = {}

    # Home Page
    page_name = 'home'
    aoi_manager.create_page(page_name)
    page_aois[page_name] = {
        'header': aoi_manager.define_aoi("Header", 0, 0, 1440, 60, page_name),
        'logo': aoi_manager.define_aoi("Logo", 50, 40, 80, 60, page_name),
        'navigation': aoi_manager.define_aoi("Menu Navigazione", 0, 160, 140, 110, page_name),
        'search_bar': aoi_manager.define_aoi("Barra di Ricerca", 70, 136, 120, 30, page_name),
        'featured_products': aoi_manager.define_aoi("Prodotti in Evidenza", 470, 280, 620, 220, page_name),
        'prodotti_in_evidenza_titolo': aoi_manager.define_aoi("Titolo Prodotti in Evidenza", 710, 280, 200, 30, page_name),
        'benvenuto_banner': aoi_manager.define_aoi("Banner di Benvenuto", 470, 90, 760, 140, page_name),
        'categories_section': aoi_manager.define_aoi("Sezione Categorie", 470, 585, 760, 150, page_name),
        'footer': aoi_manager.define_aoi("Footer", 0, 770, 1440, 30, page_name),
        'newsletter': aoi_manager.define_aoi("Newsletter", 470, 802, 760, 40, page_name)
    }

    # Carrello
    page_name = 'cart'
    aoi_manager.create_page(page_name)
    page_aois[page_name] = {
        'header': aoi_manager.define_aoi("Header", 0, 0, 1440, 60, page_name),
        'logo': aoi_manager.define_aoi("Logo", 50, 40, 80, 60, page_name),
        'carrello_titolo': aoi_manager.define_aoi("Titolo Carrello", 540, 70, 360, 40, page_name),
        'prodotti_carrello': aoi_manager.define_aoi("Prodotti nel Carrello", 480, 110, 460, 160, page_name),
        'prodotti_correlati': aoi_manager.define_aoi("Potrebbero interessarti", 480, 270, 460, 170, page_name),
        'riepilogo_ordine': aoi_manager.define_aoi("Riepilogo Ordine", 925, 108, 400, 100, page_name),
        'subtotale': aoi_manager.define_aoi("Subtotale", 925, 130, 400, 20, page_name),
        'spedizione': aoi_manager.define_aoi("Spedizione", 925, 154, 400, 20, page_name),
        'tasse': aoi_manager.define_aoi("Tasse", 925, 170, 400, 20, page_name),
        'totale': aoi_manager.define_aoi("Totale", 925, 200, 400, 25, page_name),
        'metodo_spedizione': aoi_manager.define_aoi("Metodo di Spedizione", 925, 220, 400, 75, page_name),
        'codice_promozionale': aoi_manager.define_aoi("Codice Promozionale", 925, 305, 400, 65, page_name),
        'procedi_checkout': aoi_manager.define_aoi("Procedi al Checkout", 925, 380, 400, 40, page_name),
        'spedizione_gratuita_info': aoi_manager.define_aoi("Info Spedizione Gratuita", 925, 450, 400, 50, page_name)
    }
 # ----- AOI per la pagina Prodotto -----
    page_name = 'product'
    aoi_manager.create_page(page_name)
    page_aois[page_name] = {
        'header': aoi_manager.define_aoi("Header", 0, 0, 1440, 60, page_name),
        'logo': aoi_manager.define_aoi("Logo", 50, 40, 80, 60, page_name),
        'immagine_prodotto': aoi_manager.define_aoi("Immagine Prodotto", 120, 160, 420, 360, page_name),
        'nome_prodotto': aoi_manager.define_aoi("Nome Prodotto", 600, 160, 300, 40, page_name),
        'prezzo': aoi_manager.define_aoi("Prezzo", 600, 210, 300, 30, page_name),
        'descrizione': aoi_manager.define_aoi("Descrizione", 600, 250, 500, 100, page_name),
        'selezione_quantità': aoi_manager.define_aoi("Selezione Quantità", 600, 370, 140, 40, page_name),
        'aggiungi_carrello': aoi_manager.define_aoi("Aggiungi al Carrello", 600, 420, 300, 40, page_name),
        'prodotti_correlati': aoi_manager.define_aoi("Prodotti Correlati", 140, 550, 1180, 200, page_name),
        'recensioni': aoi_manager.define_aoi("Recensioni", 600, 760, 500, 150, page_name),
        'footer': aoi_manager.define_aoi("Footer", 0, 920, 1440, 50, page_name)
    }
        # ----- AOI per la pagina Checkout -----
    page_name = 'checkout'
    aoi_manager.create_page(page_name)
    page_aois[page_name] = {
        'header': aoi_manager.define_aoi("Header", 0, 0, 1440, 60, page_name),
        'riepilogo_ordine': aoi_manager.define_aoi("Riepilogo Ordine", 100, 100, 600, 300, page_name),
        'nome': aoi_manager.define_aoi("Campo Nome", 800, 100, 400, 40, page_name),
        'indirizzo': aoi_manager.define_aoi("Campo Indirizzo", 800, 160, 400, 40, page_name),
        'metodo_pagamento': aoi_manager.define_aoi("Metodo di Pagamento", 800, 230, 400, 40, page_name),
        'conferma_acquisto': aoi_manager.define_aoi("Conferma Acquisto", 800, 300, 300, 50, page_name),
        'footer': aoi_manager.define_aoi("Footer", 0, 920, 1440, 50, page_name)
    }
        # ----- AOI per la pagina Categoria -----
    page_name = 'categoria'
    aoi_manager.create_page(page_name)
    page_aois[page_name] = {
        'header': aoi_manager.define_aoi("Header", 0, 0, 1440, 60, page_name),
        'titolo_categoria': aoi_manager.define_aoi("Titolo Categoria", 100, 80, 600, 40, page_name),
        'filtri': aoi_manager.define_aoi("Filtri", 100, 150, 250, 600, page_name),
        'lista_prodotti': aoi_manager.define_aoi("Lista Prodotti", 380, 150, 960, 600, page_name),
        'paginazione': aoi_manager.define_aoi("Paginazione", 600, 770, 300, 40, page_name),
        'footer': aoi_manager.define_aoi("Footer", 0, 920, 1440, 50, page_name)
    }

    return page_aois
