import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Rectangle
import matplotlib.patheffects as path_effects

class Visualizer:
    def __init__(self, fixations, aoi_manager=None):
        """
        Inizializza il visualizzatore.
        
        Args:
            fixations: DataFrame con le fissazioni
            aoi_manager: Istanza di AOIManager (opzionale)
        """
        self.fixations = fixations
        self.aoi_manager = aoi_manager
        
    def generate_heatmap(self, width, height, sigma=50, output_path=None, page_name=None, background_img=None):
        """
        Genera una heatmap basata sulle fissazioni.
        
        Args:
            width, height: Dimensioni dell'immagine
            sigma: Parametro di diffusione gaussiana
            output_path: Percorso per salvare l'immagine (opzionale)
            page_name: Nome della pagina per il titolo (opzionale)
            background_img: Path dell'immagine di sfondo, se disponibile (opzionale)
            
        Returns:
            Figure di matplotlib con la heatmap
        """
        if self.fixations.empty:
            print("Nessuna fissazione disponibile per generare la heatmap.")
            return None
        
        # Crea una matrice vuota per la heatmap
        heatmap = np.zeros((height, width))
        
        # Aggiungi ogni fissazione alla heatmap, pesata per durata
        for _, fixation in self.fixations.iterrows():
            x, y = int(fixation['x']), int(fixation['y'])
            
            # Assicurati che x, y siano all'interno dei limiti
            if 0 <= x < width and 0 <= y < height:
                # Peso basato sulla durata della fissazione
                weight = fixation['duration'] / 1000.0  # Converti in secondi
                
                # Calcola intervalli per la maschera gaussiana
                y_start = max(0, y-3*sigma)
                y_end = min(height, y+3*sigma)
                x_start = max(0, x-3*sigma)
                x_end = min(width, x+3*sigma)
                
                # Crea coordinate della griglia
                y_indices, x_indices = np.mgrid[y_start:y_end, x_start:x_end]
                
                # Calcola la distanza dal centro
                distances = np.sqrt((x_indices - x)**2 + (y_indices - y)**2)
                
                # Calcola il contributo gaussiano
                contribution = weight * np.exp(-(distances**2) / (2 * sigma**2))
                
                # Aggiungi alla heatmap
                heatmap[y_start:y_end, x_start:x_end] += contribution
        
        # Normalizza la heatmap
        if np.max(heatmap) > 0:
            heatmap = heatmap / np.max(heatmap)
        
        # Crea la figura con dimensioni proporzionali all'immagine
        fig, ax = plt.subplots(figsize=(width/100, height/100))
        
        # Imposta i margini della figura
        plt.subplots_adjust(left=0.05, right=0.95, top=0.95, bottom=0.05)
        
        # Carica immagine di sfondo se disponibile
        if background_img:
            try:
                bg_image = plt.imread(background_img)
                ax.imshow(bg_image, extent=[0, width, height, 0], alpha=0.8)
            except Exception as e:
                print(f"Impossibile caricare l'immagine di sfondo: {e}")
        
        # Crea una mappa di colori migliorata (trasparente -> blu -> rosso -> giallo)
        colors = [(0, 0, 0, 0), (0, 0, 1, 0.5), (1, 0, 0, 0.7), (1, 1, 0, 0.9)]
        cmap = LinearSegmentedColormap.from_list('heatmap_cmap', colors, N=256)
        
        # Visualizza la heatmap
        im = ax.imshow(heatmap, cmap=cmap, interpolation='gaussian', alpha=0.75)
        
        # Aggiungi le AOI alla figura, se disponibili
        if self.aoi_manager:
            for aoi in self.aoi_manager.get_all_aois():
                if not aoi['name']:  # Skip AOI senza nome
                    continue
                    
                rect = Rectangle(
                    (aoi['x_min'], aoi['y_min']),
                    aoi['width'], aoi['height'],
                    linewidth=2, edgecolor='blue', facecolor='none', alpha=0.8,
                    linestyle='--'
                )
                ax.add_patch(rect)
                
                # Migliora la visibilità del testo con un bordo bianco
                text = ax.text(
                    aoi['x_min'] + 5, aoi['y_min'] + 15,
                    aoi['name'],
                    color='white', fontsize=12, weight='bold',
                    bbox=dict(facecolor='blue', alpha=0.6, boxstyle='round,pad=0.3')
                )
                text.set_path_effects([path_effects.withStroke(linewidth=2, foreground='black')])
        
        # Titolo personalizzato in base alla pagina
        if page_name:
            title = f'Eye Tracking Heatmap - {page_name.capitalize()}'
        else:
            title = 'Eye Tracking Heatmap'
            
        ax.set_title(title, fontsize=14, pad=10)
        
        # Aggiungi una colorbar più descrittiva
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label('Intensità di fissazione', fontsize=10)
        
        # Rimuovi assi per un aspetto più pulito
        ax.set_xticks([])
        ax.set_yticks([])
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)
        
        # Aggiungi annotazione con statistiche chiave
        stats_text = (
            f"Totale fissazioni: {len(self.fixations)}\n"
            f"Durata media: {self.fixations['duration'].mean():.1f} ms"
        )
        plt.figtext(0.02, 0.02, stats_text, fontsize=8, 
                   bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
        
        # Salva la figura con alta risoluzione se richiesto
        if output_path:
            fig.savefig(output_path, dpi=300, bbox_inches="tight", facecolor='white')
            print(f"Heatmap salvata come '{output_path}'")
        
        plt.close()  # Chiudi la figura per liberare memoria
        return fig
    
    def visualize_scanpath(self, output_path=None, page_name=None, background_img=None):
        """
        Visualizza il percorso di scansione (scanpath).
        
        Args:
            output_path: Percorso per salvare l'immagine (opzionale)
            page_name: Nome della pagina per il titolo (opzionale)
            background_img: Path dell'immagine di sfondo, se disponibile (opzionale)
            
        Returns:
            Figure di matplotlib con lo scanpath
        """
        if self.fixations.empty:
            print("Nessuna fissazione disponibile per visualizzare lo scanpath.")
            return None
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Se è disponibile un'immagine di sfondo, visualizzala
        if background_img:
            try:
                bg_image = plt.imread(background_img)
                ax.imshow(bg_image, extent=[0, self.fixations['x'].max()*1.1, 
                                           self.fixations['y'].max()*1.1, 0], 
                         alpha=0.7)
            except Exception as e:
                print(f"Impossibile caricare l'immagine di sfondo: {e}")
        
        # Definisci limiti del grafico in base ai dati
        x_max = self.fixations['x'].max() * 1.1
        y_max = self.fixations['y'].max() * 1.1
        
        # Ordina fissazioni cronologicamente
        sorted_fix = self.fixations.sort_values('start_time')
        
        # Crea un gradiente di colori per le saccadi per mostrare la progressione temporale
        cmap = plt.cm.viridis
        colors = cmap(np.linspace(0, 1, len(sorted_fix)-1))
        
        # Disegna la saccade (linea tra fissazioni) con colori graduali
        for i in range(len(sorted_fix) - 1):
            ax.plot(
                [sorted_fix.iloc[i]['x'], sorted_fix.iloc[i+1]['x']],
                [sorted_fix.iloc[i]['y'], sorted_fix.iloc[i+1]['y']],
                '-', color=colors[i], alpha=0.7, linewidth=1.5
            )
        
        # Disegna le fissazioni come cerchi, dimensione proporzionale alla durata
        sizes = sorted_fix['duration'] / 20  # Scala la dimensione in base alla durata
        
        # Usa un gradiente di colori anche per le fissazioni
        sc = ax.scatter(sorted_fix['x'], sorted_fix['y'], s=sizes, 
                      c=range(len(sorted_fix)), cmap=cmap, 
                      alpha=0.8, edgecolor='black', linewidth=0.5)
        
        # Aggiungi numero progressivo per mostrare l'ordine delle fissazioni
        for i, (_, fixation) in enumerate(sorted_fix.iterrows()):
            text = ax.text(fixation['x']+10, fixation['y']+10, str(i+1), fontsize=9)
            text.set_path_effects([path_effects.withStroke(linewidth=2, foreground='white')])
        
        # Aggiungi le AOI, se disponibili
        if self.aoi_manager:
            for aoi in self.aoi_manager.get_all_aois():
                if not aoi['name']:  # Skip AOI senza nome
                    continue
                    
                rect = Rectangle(
                    (aoi['x_min'], aoi['y_min']),
                    aoi['width'], aoi['height'],
                    linewidth=2, edgecolor='green', facecolor='none', alpha=0.7,
                    linestyle='--'
                )
                ax.add_patch(rect)
                
                # Migliora la visibilità del testo con un bordo bianco
                text = ax.text(
                    aoi['x_min'] + 5, aoi['y_min'] + 15,
                    aoi['name'],
                    color='white', fontsize=11, weight='bold',
                    bbox=dict(facecolor='green', alpha=0.6, boxstyle='round,pad=0.2')
                )
                text.set_path_effects([path_effects.withStroke(linewidth=2, foreground='black')])
        
        ax.set_xlim(0, x_max)
        ax.set_ylim(y_max, 0)  # Inverti asse y per coordinate schermo
        
        # Titolo personalizzato in base alla pagina
        if page_name:
            title = f'Scanpath Eye Tracking - {page_name.capitalize()}'
        else:
            title = 'Scanpath Eye Tracking'
            
        ax.set_title(title, fontsize=14)
        ax.set_xlabel('Posizione X (pixel)')
        ax.set_ylabel('Posizione Y (pixel)')
        
        # Aggiungi una colorbar che mostra la progressione temporale
        cbar = plt.colorbar(sc, ax=ax, label='Sequenza temporale')
        cbar.set_ticks([0, len(sorted_fix)-1])
        cbar.set_ticklabels(['Inizio', 'Fine'])
        
        # Salva la figura se richiesto
        if output_path:
            fig.savefig(output_path, dpi=300, bbox_inches="tight")
            print(f"Scanpath salvato come '{output_path}'")
        
        plt.close()  # Chiudi la figura per liberare memoria
        return fig