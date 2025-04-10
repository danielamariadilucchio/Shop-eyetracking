class MetricsCalculator:
    def __init__(self, fixations, aoi_manager):
        """
        Inizializza il calcolatore di metriche.
        
        Args:
            fixations: DataFrame con le fissazioni
            aoi_manager: Istanza di AOIManager
        """
        self.fixations = fixations
        self.aoi_manager = aoi_manager
        
    def calculate_ttff(self, aoi_idx, start_time=None):
        """
        Calcola il Time To First Fixation (TTFF) per un'AOI.
        
        Args:
            aoi_idx: Indice dell'AOI
            start_time: Timestamp di inizio (opzionale)
            
        Returns:
            TTFF in millisecondi o None se nessuna fissazione nell'AOI
        """
        if self.fixations.empty:
            return None
            
        # Se start_time non è fornito, usa il primo timestamp
        if start_time is None:
            start_time = self.fixations['start_time'].min()
        
        # Ordina le fissazioni per tempo
        sorted_fixations = self.fixations.sort_values('start_time')
        
        # Trova la prima fissazione nell'AOI
        for _, fixation in sorted_fixations.iterrows():
            if self.aoi_manager.is_point_in_aoi(fixation['x'], fixation['y'], aoi_idx):
                return fixation['start_time'] - start_time
        
        return None
    
    def calculate_dwell_time(self, aoi_idx):
        """
        Calcola il Dwell Time per un'AOI.
        
        Args:
            aoi_idx: Indice dell'AOI
            
        Returns:
            Dwell Time in millisecondi e numero di fissazioni
        """
        if self.fixations.empty:
            return 0, 0
        
        # Somma le durate di tutte le fissazioni nell'AOI
        total_dwell_time = 0
        fixation_count = 0
        
        for _, fixation in self.fixations.iterrows():
            if self.aoi_manager.is_point_in_aoi(fixation['x'], fixation['y'], aoi_idx):
                total_dwell_time += fixation['duration']
                fixation_count += 1
        
        return total_dwell_time, fixation_count
    
    def aoi_statistics(self, aoi_idx, start_time=None):
        """
        Calcola statistiche complete per un'AOI.
        
        Args:
            aoi_idx: Indice dell'AOI
            start_time: Timestamp di inizio (opzionale)
            
        Returns:
            Dizionario con statistiche complete
        """
        aoi = self.aoi_manager.get_aoi(aoi_idx)
        ttff = self.calculate_ttff(aoi_idx, start_time)
        dwell_time, fixation_count = self.calculate_dwell_time(aoi_idx)
        
        stats = {
            'name': aoi['name'],
            'ttff': ttff,
            'dwell_time': dwell_time,
            'fixation_count': fixation_count,
            'mean_fixation_duration': 0
        }
        
        # Calcola la durata media delle fissazioni se ce ne sono
        if fixation_count > 0:
            aoi_fixations = []
            for _, fixation in self.fixations.iterrows():
                if self.aoi_manager.is_point_in_aoi(fixation['x'], fixation['y'], aoi_idx):
                    aoi_fixations.append(fixation)
            
            durations = [fix['duration'] for fix in aoi_fixations]
            stats['mean_fixation_duration'] = sum(durations) / len(durations)
        
        return stats
    
    def summary_report(self, start_time=None, end_time=None):
        """
        Genera un report di riepilogo completo.
        
        Args:
            start_time: Timestamp di inizio (opzionale)
            end_time: Timestamp di fine (opzionale)
            
        Returns:
            Dizionario con statistiche riepilogative
        """
        if self.fixations.empty:
            return {
                'n_fixations': 0,
                'recording_duration_ms': 0
            }
        
        # Se start_time/end_time non sono forniti, usa i valori delle fissazioni
        if start_time is None:
            start_time = self.fixations['start_time'].min()
        if end_time is None:
            end_time = self.fixations['end_time'].max()
        
        recording_duration = end_time - start_time
        
        report = {
            'n_fixations': len(self.fixations),
            'recording_duration_ms': recording_duration,
            'mean_fixation_duration': self.fixations['duration'].mean(),
            'total_fixation_time': self.fixations['duration'].sum(),
            'fixation_rate': len(self.fixations) / (recording_duration / 1000)
        }
        
        # Aggiungi statistiche per ogni AOI
        report['aois'] = []
        for i in range(len(self.aoi_manager.get_all_aois())):
            report['aois'].append(self.aoi_statistics(i, start_time))
        
        return report