import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3; // Reduced from 5 to 3 to prevent overlap
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Show first page only if we're not starting from page 1
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key={1}
          style={[styles.pageButton, currentPage === 1 && styles.activePageButton]}
          onPress={() => onPageChange(1)}
        >
          <Text style={[styles.pageButtonText, currentPage === 1 && styles.activePageButtonText]}>
            1
          </Text>
        </TouchableOpacity>
      );
      
      if (startPage > 2) {
        pages.push(
          <Text key="dots1" style={styles.dots}>...</Text>
        );
      }
    }

    // Page numbers in visible range
    for (let i = startPage; i <= endPage; i++) {
      // Skip if already added as first page
      if (i === 1 && startPage > 1) continue;
      
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, currentPage === i && styles.activePageButton]}
          onPress={() => onPageChange(i)}
        >
          <Text style={[styles.pageButtonText, currentPage === i && styles.activePageButtonText]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Show last page only if we're not ending with last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="dots2" style={styles.dots}>...</Text>
        );
      }
      
      pages.push(
        <TouchableOpacity
          key={totalPages}
          style={[styles.pageButton, currentPage === totalPages && styles.activePageButton]}
          onPress={() => onPageChange(totalPages)}
        >
          <Text style={[styles.pageButtonText, currentPage === totalPages && styles.activePageButtonText]}>
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {startItem}-{endItem} / {totalItems} kayıt
        </Text>
      </View>
      
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={[styles.navButtonText, currentPage === 1 && styles.disabledButtonText]}>
            ‹ Önceki
          </Text>
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {renderPageNumbers()}
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.navButtonText, currentPage === totalPages && styles.disabledButtonText]}>
            Sonraki ›
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 70,
    alignItems: 'center',
    flex: 0,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#F0F0F0',
  },
  navButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#BDBDBD',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  pageButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 1,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePageButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activePageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dots: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 4,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default Pagination;