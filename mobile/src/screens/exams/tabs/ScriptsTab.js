import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { FileText, Download, Eye, X, RefreshCw } from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

const ScriptsTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [filterCycle, setFilterCycle] = useState('all');
  const [viewingScript, setViewingScript] = useState(null);
  const [pdfSource, setPdfSource] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchScripts = useCallback(async () => {
    try {
      const data = await examService.getMyScripts();
      setScripts(data?.data || []);

      // Extract unique cycles
      const uniqueCycles = [
        ...new Set(data?.data?.map(s => s.schedule?.cycle?.id).filter(Boolean)),
      ].map(id => {
        const script = data?.data?.find(s => s.schedule?.cycle?.id === id);
        return {
          id,
          name: script?.schedule?.cycle?.name || 'Unknown Cycle',
        };
      });
      setCycles(uniqueCycles);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScripts();
  };

  const handleViewScript = async script => {
    setViewingScript(script);
    try {
      const path = await examService.viewScript(script.id);
      setPdfSource({ uri: path, cache: true });
    } catch (error) {
      alert('Failed to load script');
      setViewingScript(null);
    }
  };

  const handleDownloadScript = async script => {
    setDownloading(script.id);
    try {
      const result = await examService.downloadScript(
        script.id,
        script.schedule?.course?.name || 'Script',
        script.schedule?.course?.code || 'CODE',
      );
      if (result.success) {
        alert(`Script downloaded to ${result.path}`);
      }
    } catch (error) {
      alert('Failed to download script');
    } finally {
      setDownloading(null);
    }
  };

  const filteredScripts =
    filterCycle === 'all'
      ? scripts
      : scripts.filter(s => s.schedule?.cycle?.id === filterCycle);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Cycle</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            onPress={() => setFilterCycle('all')}
            style={[
              styles.filterChip,
              filterCycle === 'all' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                filterCycle === 'all' && styles.filterChipTextActive,
              ]}
            >
              All Cycles
            </Text>
          </TouchableOpacity>
          {cycles.map(cycle => (
            <TouchableOpacity
              key={cycle.id}
              onPress={() => setFilterCycle(cycle.id)}
              style={[
                styles.filterChip,
                filterCycle === cycle.id && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCycle === cycle.id && styles.filterChipTextActive,
                ]}
              >
                {cycle.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {filteredScripts.length > 0 ? (
          filteredScripts.map(script => (
            <Surface key={script.id} style={styles.scriptCard}>
              <View style={styles.scriptHeader}>
                <View style={styles.scriptIconBox}>
                  <FileText size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.scriptInfo}>
                  <Text style={styles.scriptCourse}>
                    {script.schedule?.course?.name}
                  </Text>
                  <Text style={styles.scriptCode}>
                    {script.schedule?.course?.code}
                  </Text>
                  <Text style={styles.scriptCycle}>
                    {script.schedule?.cycle?.name}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => handleViewScript(script)}
                  style={styles.actionButton}
                >
                  <Eye size={16} color={theme.colors.primary} />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDownloadScript(script)}
                  disabled={downloading === script.id}
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                >
                  {downloading === script.id ? (
                    <RefreshCw size={16} color="#fff" />
                  ) : (
                    <Download size={16} color="#fff" />
                  )}
                  <Text style={styles.actionTextWhite}>Download</Text>
                </TouchableOpacity>
              </View>
            </Surface>
          ))
        ) : (
          <Surface style={styles.emptyCard}>
            <FileText size={64} color="#e0e7ff" />
            <Text style={styles.emptyTitle}>No Scripts Available</Text>
            <Text style={styles.emptySubtitle}>
              Your evaluated answer scripts will appear here once published.
            </Text>
          </Surface>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PDF Viewer Modal */}
      <Modal
        visible={!!viewingScript}
        animationType="slide"
        onRequestClose={() => {
          setViewingScript(null);
          setPdfSource(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle}>
                {viewingScript?.schedule?.course?.name}
              </Text>
              <Text style={styles.modalSubtitle}>
                {viewingScript?.schedule?.cycle?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setViewingScript(null);
                setPdfSource(null);
              }}
              style={styles.closeButton}
            >
              <X size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          {pdfSource ? (
            <Pdf
              source={pdfSource}
              style={styles.pdf}
              onError={error => {
                console.error('PDF Error:', error);
                alert('Failed to display PDF');
                setViewingScript(null);
                setPdfSource(null);
              }}
            />
          ) : (
            <View style={styles.pdfLoader}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.pdfLoaderText}>Loading Script...</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    padding: 20,
    paddingBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  scriptCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scriptIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scriptInfo: {
    flex: 1,
    marginLeft: 16,
  },
  scriptCourse: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  scriptCode: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scriptCycle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: width,
    backgroundColor: '#f8fafc',
  },
  pdfLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfLoaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ScriptsTab;
